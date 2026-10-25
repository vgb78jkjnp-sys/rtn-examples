namespace RTN.Framework.Authentication
{
    public class AuthenticatedUser
    {
        public string UserId { get; set; }
        public string EncryptedPassword { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }        
        public string Roles { get; set; }
        public string Status { get; set; }
    }
}
