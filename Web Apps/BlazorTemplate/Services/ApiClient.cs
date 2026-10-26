using System.Net.Http.Json;
using System.Security.Principal;
using System.Text.Json;

namespace BlazorApp.Services;

public sealed class ApiClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = null
    };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<ApiClient> _logger;

    public ApiClient(
        IHttpClientFactory httpClientFactory,
        IHttpContextAccessor httpContextAccessor,
        ILogger<ApiClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<ApiCommandResponse> InvokeAsync(
        ApiEndpoint endpoint,
        object? body,
        CancellationToken cancellationToken = default)
    {
        var identity = _httpContextAccessor.HttpContext?.User.Identity;
        if (identity is WindowsIdentity windowsIdentity && OperatingSystem.IsWindows())
        {
            return await WindowsIdentity.RunImpersonatedAsync(
                windowsIdentity.AccessToken,
                () => SendAsync(endpoint, body, cancellationToken));
        }

        return await SendAsync(endpoint, body, cancellationToken);
    }

    private async Task<ApiCommandResponse> SendAsync(
        ApiEndpoint endpoint,
        object? body,
        CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient("Api");
        using var request = new HttpRequestMessage(endpoint.Method, endpoint.Path.TrimStart('/'));

        if (endpoint.Method != HttpMethod.Get && body is not null)
            request.Content = JsonContent.Create(body, options: JsonOptions);

        using var response = await client.SendAsync(request, cancellationToken);
        var payload = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "API {Method} {Path} failed with {StatusCode}: {Payload}",
                endpoint.Method,
                endpoint.Path,
                (int)response.StatusCode,
                payload);
            throw new InvalidOperationException(
                $"API error ({(int)response.StatusCode}) calling {endpoint.Path}.");
        }

        var result = JsonSerializer.Deserialize<ApiCommandResponse>(payload, JsonOptions)
            ?? throw new InvalidOperationException($"Empty response from {endpoint.Path}.");

        if (result.Status is not null && result.Status.Trim().StartsWith("error", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException(string.IsNullOrWhiteSpace(result.Message) ? "API error" : result.Message);

        return result;
    }
}
