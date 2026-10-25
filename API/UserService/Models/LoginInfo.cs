namespace UserService.Models;

public class LoginInfo
{
    public string UserId { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Roles { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}
