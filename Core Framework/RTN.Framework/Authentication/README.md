# RTN.Framework.Authentication

Authentication library for RTN.Framework.
------------------------------------------
File					Purpose
PasswordEncryptor		C# port of VB Manufacturing.User.Encrypt 
UserAuthenticator		Encrypts the plain password, then calls USERBEAN / USER / CHECK_USER_ACCESS
IUserAuthenticator		DI-friendly interface
AuthenticationResult/	AuthenticatedUser
Auth response models

Registering the service
-----------------------
using RTN.Framework.Authentication;

builder.Services.AddSingleton<IUserAuthenticator>(sp =>
    new UserAuthenticator(
        sp.GetRequiredService<IDbExecutor>(),
        sp.GetRequiredService<IRotatingLogger>()
    )
);

Example usage
-------------
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var result = await _userAuthenticator.AuthenticateAsync(request.UserId, request.Password);
    if (!result.IsAuthenticated)
        return Unauthorized(new { result.Message });
    return Ok(new
    {
        userId = result.User.UserId,
        firstName = result.User.FirstName,
        lastName = result.User.LastName,
        email = result.User.Email,
        roles = result.User.Roles,
        status = result.User.Status
    });
}

