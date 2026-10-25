using System;
using System.Text;

namespace RTN.Framework.Authentication
{
    /// <summary>
    /// Legacy password encryption compatible with the original VB Manufacturing.User.Encrypt implementation.
    /// </summary>
    public static class PasswordEncryptor
    {
        private const int CodeOffset = 107;
        private const int KeyXor = 133;
        private const string Prefix = "PWD_";

        public static string Encrypt(string plainText)
        {
            if (plainText == null)
                throw new ArgumentNullException(nameof(plainText));

            var result = new StringBuilder(Prefix, Prefix.Length + plainText.Length);
            for (var i = 0; i < plainText.Length; i++)
            {
                var charVal = (int)plainText[i] + CodeOffset;
                charVal ^= KeyXor;
                result.Append((char)charVal);
            }

            return result.ToString();
        }

        public static string Decrypt(string encryptedText)
        {
            if (encryptedText == null)
                throw new ArgumentNullException(nameof(encryptedText));

            if (!encryptedText.StartsWith(Prefix, StringComparison.Ordinal))
                throw new ArgumentException("Encrypted password must start with 'PWD_'.", nameof(encryptedText));

            var result = new StringBuilder(encryptedText.Length - Prefix.Length);
            for (var i = Prefix.Length; i < encryptedText.Length; i++)
            {
                var charVal = (int)encryptedText[i];
                charVal ^= KeyXor;
                charVal -= CodeOffset;
                result.Append((char)charVal);
            }

            return result.ToString();
        }
    }
}
