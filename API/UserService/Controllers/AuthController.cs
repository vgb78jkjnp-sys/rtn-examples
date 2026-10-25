using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using RTN.Framework.Authentication;
using RTN.Framework.Data;
using UserService.Models;

namespace UserService.Controllers;

[ApiController]
[Route("")]
public class AuthController : ControllerBase
{
    private readonly IUserAuthenticator _userAuthenticator;
    private readonly CommandExecutor _commandExecutor;

    public AuthController(IUserAuthenticator userAuthenticator, CommandExecutor commandExecutor)
    {
        _userAuthenticator = userAuthenticator;
        _commandExecutor = commandExecutor;
    }

    [HttpGet("auth-status")]
    [Authorize]
    public async Task<IActionResult> GetAuthStatus()
    {
        var userId = User.Identity?.Name;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User ID not found" });

        var paramValues = new JObject { { "UserId", userId } };
        var result = await _commandExecutor.ExecuteCommandAsync("GETUSERACCESS", paramValues);
        
        if (string.IsNullOrEmpty(result))
            return Unauthorized(new { message = "No result returned from GETUSERACCESS command" });
        
        var jObject = JObject.Parse(result);
        var data = GetUserAccessRow(jObject);

        if (data == null)
            return Unauthorized(new { message = "User data not found" });

        var ipAddress = GetClientIpAddress();
        var hostName = await GetClientHostNameAsync(ipAddress);

        return Ok(new
        {
            isAuthenticated = User.Identity?.IsAuthenticated ?? false,
            name = User.Identity?.Name,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
            ipAddress,
            hostName,
            userId = data["User_ID"]?.ToString(),
            firstName = data["First_Name"]?.ToString(),
            lastName = data["Last_Name"]?.ToString(),
            email = data["Email"]?.ToString(),
            roles = data["Roles"]?.ToString(),
            status = data["Status"]?.ToString()
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginInfo request)
    {
        var result = await _userAuthenticator.AuthenticateAsync(request.UserId, request.Password);
        if (!result.IsAuthenticated)
            return Unauthorized(new { result.Message });

        var ipAddress = GetClientIpAddress();
        var hostName = await GetClientHostNameAsync(ipAddress);

        return Ok(new
        {
            userId = result.User.UserId,
            firstName = result.User.FirstName,
            lastName = result.User.LastName,
            email = result.User.Email,
            roles = result.User.Roles,
            status = result.User.Status,
            ipAddress,
            hostName
        });
    }

    private string? GetClientIpAddress()
    {
        var forwardedFor = HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
            return NormalizeIpAddress(forwardedFor.Split(',')[0].Trim());

        var realIp = HttpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(realIp))
            return NormalizeIpAddress(realIp.Trim());

        return NormalizeIpAddress(HttpContext.Connection.RemoteIpAddress?.ToString());
    }

    private static string? NormalizeIpAddress(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress))
            return null;

        var value = ipAddress.Trim();
        if (value.StartsWith('[') && value.EndsWith(']'))
            value = value[1..^1];

        if (!IPAddress.TryParse(value, out var parsed))
            return value;

        if (IPAddress.IsLoopback(parsed))
            return "127.0.0.1";

        if (parsed.IsIPv4MappedToIPv6)
            return parsed.MapToIPv4().ToString();

        return parsed.ToString();
    }

    private async Task<string?> GetClientHostNameAsync(string? ipAddress)
    {
        var iisRemoteHost = HttpContext.GetServerVariable("REMOTE_HOST");
        if (IsUsableHostName(iisRemoteHost, ipAddress))
            return iisRemoteHost;

        return await TryGetHostNameFromIpAsync(ipAddress);
    }

    private static bool IsUsableHostName(string? hostName, string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(hostName))
            return false;

        if (IPAddress.TryParse(hostName, out _))
            return false;

        return !string.Equals(hostName, ipAddress, StringComparison.OrdinalIgnoreCase);
    }

    private static async Task<string?> TryGetHostNameFromIpAsync(string? ipAddress)
    {
        if (string.IsNullOrWhiteSpace(ipAddress) || !IPAddress.TryParse(ipAddress, out var parsed))
            return null;

        if (IPAddress.IsLoopback(parsed))
        {
            try
            {
                return Environment.MachineName;
            }
            catch
            {
                return null;
            }
        }

        try
        {
            var entry = await Dns.GetHostEntryAsync(parsed);
            if (IsUsableHostName(entry.HostName, ipAddress))
                return entry.HostName;

            var alias = entry.Aliases?.FirstOrDefault(a => IsUsableHostName(a, ipAddress));
            return alias;
        }
        catch (SocketException)
        {
            return null;
        }
    }

    /// <summary>
    /// CommandExecutor wraps each action result in Data[]; the element is often a JSON string, not an object.
    /// </summary>
    private static JObject? GetUserAccessRow(JObject commandResult)
    {
        var dataArray = commandResult["Data"] as JArray;
        if (dataArray == null || dataArray.Count == 0)
            return null;

        var first = dataArray[0];
        JObject? transactionPayload = first as JObject;
        if (transactionPayload == null && first.Type == JTokenType.String)
            transactionPayload = JObject.Parse(first.Value<string>()!);

        return transactionPayload?["USER"]?.First as JObject;
    }
}
