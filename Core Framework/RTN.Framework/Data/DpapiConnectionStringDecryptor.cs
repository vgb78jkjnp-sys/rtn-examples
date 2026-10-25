using System;
using System.Security.Cryptography;
using System.Text;

namespace RTN.Framework.Data
{
    /// <summary>
    /// Decrypts connection strings that were encrypted with Windows DPAPI and encoded as base64.
    /// Note: This implementation is Windows-only and depends on DPAPI (ProtectedData).
    /// </summary>
    public class DpapiConnectionStringDecryptor : IConnectionStringDecryptor
    {
        private readonly DataProtectionScope _scope;

        public DpapiConnectionStringDecryptor(DataProtectionScope scope = DataProtectionScope.CurrentUser)
        {
            _scope = scope;
        }

        public string Decrypt(string encrypted)
        {
            if (string.IsNullOrEmpty(encrypted))
                return encrypted;

            try
            {
                // Expect input to be base64 of the protected payload
                var protectedBytes = Convert.FromBase64String(encrypted);
                var clearBytes = ProtectedData.Unprotect(protectedBytes, null, _scope);
                return Encoding.UTF8.GetString(clearBytes);
            }
            catch (FormatException ex)
            {
                throw new InvalidOperationException("Encrypted connection string is not a valid base64 string.", ex);
            }
            catch (CryptographicException ex)
            {
                throw new InvalidOperationException("Failed to decrypt connection string with DPAPI.", ex);
            }
        }
    }
}
