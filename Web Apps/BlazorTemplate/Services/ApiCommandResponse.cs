using System.Text.Json;

namespace BlazorApp.Services;

public sealed class ApiCommandResponse
{
    public string? Status { get; set; }
    public string? Message { get; set; }
    public List<JsonElement>? Data { get; set; }
}
