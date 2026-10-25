namespace RTN.Framework.Authentication
{
    public class AuthenticationResult
    {
        public bool IsAuthenticated { get; set; }
        public string Message { get; set; }
        public AuthenticatedUser User { get; set; }

        public static AuthenticationResult Success(AuthenticatedUser user) =>
            new AuthenticationResult
            {
                IsAuthenticated = true,
                User = user
            };

        public static AuthenticationResult Failed(string message = "Invalid user ID or password.") =>
            new AuthenticationResult
            {
                IsAuthenticated = false,
                Message = message
            };
    }
}
