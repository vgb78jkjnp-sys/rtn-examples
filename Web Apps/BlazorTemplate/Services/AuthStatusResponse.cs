namespace BlazorApp.Services;

public sealed class AuthStatusResponse
{
    public bool IsAuthenticated { get; set; }
    public string? Name { get; set; }
    public string? UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Roles { get; set; }
    public string? Status { get; set; }

    public string DisplayName
    {
        get
        {
            var fullName = $"{FirstName} {LastName}".Trim();
            if (!string.IsNullOrEmpty(fullName))
                return fullName;
            if (!string.IsNullOrEmpty(Name))
                return Name;
            return UserId ?? "Unknown user";
        }
    }
}
