using Newtonsoft.Json.Linq;
using RTN.Framework.Data;
using RTN.Framework.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RTN.Framework.Authentication
{
    public class UserAuthenticator : IUserAuthenticator
    {
        private readonly IDbExecutor _dbExecutor;
        private readonly IRotatingLogger _logger;
        private readonly UserAuthenticationOptions _options;

        public UserAuthenticator(
            IDbExecutor dbExecutor,
            IRotatingLogger logger,
            UserAuthenticationOptions options = null)
        {
            _dbExecutor = dbExecutor ?? throw new ArgumentNullException(nameof(dbExecutor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _options = options ?? new UserAuthenticationOptions();
        }

        public async Task<AuthenticationResult> AuthenticateAsync(string userId, string plainTextPassword)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return AuthenticationResult.Failed("User ID is required.");

            if (string.IsNullOrEmpty(plainTextPassword))
                return AuthenticationResult.Failed("Password is required.");

            try
            {
                var encryptedPassword = PasswordEncryptor.Encrypt(plainTextPassword);
                var parameters = new JObject
                {
                    [_options.UserIdParameterName] = userId,
                    [_options.PasswordParameterName] = encryptedPassword
                };

                _logger?.Log(
                    $"[{GetType().FullName}.{nameof(AuthenticateAsync)}] - Authenticating user '{userId}' via {_options.BeanName}/{_options.TransactionName}/{_options.AuthenticateActionName}.");

                var json = await _dbExecutor.ExecuteActionAsync(
                    _options.BeanName,
                    _options.TransactionName,
                    _options.AuthenticateActionName,
                    parameters);

                var user = ParseUser(json);
                if (user == null)
                {
                    _logger?.Log($"[{GetType().FullName}.{nameof(AuthenticateAsync)}] - Authentication failed for user '{userId}'.");
                    return AuthenticationResult.Failed();
                }

                _logger?.Log($"[{GetType().FullName}.{nameof(AuthenticateAsync)}] - Authentication succeeded for user '{userId}'.");
                return AuthenticationResult.Success(user);
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(AuthenticateAsync)}] - Exception authenticating user '{userId}': {ex.Message}");
                return AuthenticationResult.Failed(ex.Message);
            }
        }

        public async Task<bool> UserExistsAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return false;

            try
            {
                var parameters = new JObject
                {
                    [_options.UserIdParameterName] = userId
                };

                var json = await _dbExecutor.ExecuteActionAsync(
                    _options.BeanName,
                    _options.TransactionName,
                    _options.ValidateUserIdActionName,
                    parameters);

                var rows = GetResultRows(json);
                var firstRow = rows.FirstOrDefault();
                if (firstRow == null)
                    return false;

                var validUserId = GetTokenValue(firstRow, "ValidUserId");
                return string.Equals(validUserId, "Y", StringComparison.OrdinalIgnoreCase);
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(UserExistsAsync)}] - Exception validating user '{userId}': {ex.Message}");
                return false;
            }
        }

        private AuthenticatedUser ParseUser(string json)
        {
            var row = GetResultRows(json).FirstOrDefault();
            if (row == null)
                return null;

            return new AuthenticatedUser
            {                
                UserId = GetTokenValue(row, "User_ID"),
                EncryptedPassword = GetTokenValue(row, "User_Password"),
                FirstName = GetTokenValue(row, "First_Name"),
                LastName = GetTokenValue(row, "Last_Name"),
                Email = GetTokenValue(row, "Email"),                
                Roles = GetTokenValue(row, "Roles"),
                Status = GetTokenValue(row, "Status")
            };
        }

        private IEnumerable<JObject> GetResultRows(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
                return Enumerable.Empty<JObject>();

            var root = JObject.Parse(json);
            var transactionToken = root[_options.TransactionName];
            if (transactionToken == null)
                return Enumerable.Empty<JObject>();

            if (transactionToken is JArray array)
                return array.OfType<JObject>();

            if (transactionToken is JObject singleRow)
                return new[] { singleRow };

            return Enumerable.Empty<JObject>();
        }

        private static string GetTokenValue(JObject row, string propertyName)
        {
            return row.Properties()
                .FirstOrDefault(p => string.Equals(p.Name, propertyName, StringComparison.OrdinalIgnoreCase))
                ?.Value?.ToString();
        }

        private static int? GetIntValue(JObject row, string propertyName)
        {
            var value = GetTokenValue(row, propertyName);
            return int.TryParse(value, out var parsed) ? parsed : (int?)null;
        }
    }
}
