namespace RTN.Framework.Authentication
{
    /// <summary>
    /// Maps to the USERBEAN actions defined in App_Data/BEAN-INF/UserBean.xml.
    /// </summary>
    public class UserAuthenticationOptions
    {
        public string BeanName { get; set; } = "USERBEAN";
        public string TransactionName { get; set; } = "USER";
        public string AuthenticateActionName { get; set; } = "CHECK_USER_ACCESS";
        public string ValidateUserIdActionName { get; set; } = "CHECK_IF_USERID_EXISTS";
        public string UserIdParameterName { get; set; } = "UserId";
        public string PasswordParameterName { get; set; } = "Password";
    }
}
