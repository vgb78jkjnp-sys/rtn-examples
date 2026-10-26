using System.Net;
using System.Net.Http.Json;
using System.Security.Principal;

namespace BlazorApp.Services;

public sealed class UserServiceAuthClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<UserServiceAuthClient> _logger;

    public UserServiceAuthClient(
        IHttpClientFactory httpClientFactory,
        IHttpContextAccessor httpContextAccessor,
        ILogger<UserServiceAuthClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<AuthStatusResponse?> GetAuthStatusAsync(CancellationToken cancellationToken = default)
    {
        var context = _httpContextAccessor.HttpContext;
        if (context?.User.Identity?.IsAuthenticated != true)
            return null;

        try
        {
            if (context.User.Identity is WindowsIdentity windowsIdentity)
                return await RunAsUserAsync(windowsIdentity, cancellationToken);

            return await SendAuthStatusRequestAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load auth status from UserService.");
            return new AuthStatusResponse
            {
                IsAuthenticated = true,
                Name = context.User.Identity.Name
            };
        }
    }

    private async Task<AuthStatusResponse?> RunAsUserAsync(WindowsIdentity windowsIdentity, CancellationToken cancellationToken)
    {
        if (OperatingSystem.IsWindows())
        {
            return await WindowsIdentity.RunImpersonatedAsync(
                windowsIdentity.AccessToken,
                () => SendAuthStatusRequestAsync(cancellationToken));
        }

        return await SendAuthStatusRequestAsync(cancellationToken);
    }

    private async Task<AuthStatusResponse?> SendAuthStatusRequestAsync(CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient("UserService");
        using var response = await client.GetAsync("auth-status", cancellationToken);

        if (response.StatusCode == HttpStatusCode.Unauthorized)
            return null;

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<AuthStatusResponse>(cancellationToken: cancellationToken);
    }
}
