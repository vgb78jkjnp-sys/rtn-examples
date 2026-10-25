using System.Threading.Tasks;

namespace RTN.Framework.Authentication
{
    public interface IUserAuthenticator
    {
        Task<AuthenticationResult> AuthenticateAsync(string userId, string plainTextPassword);
        Task<bool> UserExistsAsync(string userId);
    }
}
