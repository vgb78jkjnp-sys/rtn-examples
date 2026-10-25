using System;
using System.Text;
using System.Security.Cryptography;

namespace RTN.Framework.Data
{
    /// <summary>
    /// Provides simple TripleDES encryption/decryption using an MD5-derived key.
    /// Ported from the original VB implementation.
    /// </summary>
    public static class CryptorEngine
    {
        private const string DefaultKey = "PA ShopFlow";

        public static string Encrypt(string toEncrypt)
        {
            if (toEncrypt == null)
                throw new ArgumentNullException(nameof(toEncrypt));

            var toEncryptArray = Encoding.UTF8.GetBytes(toEncrypt);

            // Derive key bytes using MD5 (matches original implementation)
            byte[] keyArray;
            using (var md5 = MD5.Create())
            {
                keyArray = md5.ComputeHash(Encoding.UTF8.GetBytes(DefaultKey));
            }

            using (var tdes = new TripleDESCryptoServiceProvider())
            {
                tdes.Key = keyArray;
                tdes.Mode = CipherMode.ECB;
                tdes.Padding = PaddingMode.PKCS7;

                using (var transform = tdes.CreateEncryptor())
                {
                    var resultArray = transform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
                    return Convert.ToBase64String(resultArray, 0, resultArray.Length);
                }
            }
        }

        public static string Decrypt(string cipherString)
        {
            if (cipherString == null)
                throw new ArgumentNullException(nameof(cipherString));

            var toEncryptArray = Convert.FromBase64String(cipherString);

            byte[] keyArray;
            using (var md5 = MD5.Create())
            {
                keyArray = md5.ComputeHash(Encoding.UTF8.GetBytes(DefaultKey));
            }

            using (var tdes = new TripleDESCryptoServiceProvider())
            {
                tdes.Key = keyArray;
                tdes.Mode = CipherMode.ECB;
                tdes.Padding = PaddingMode.PKCS7;

                using (var transform = tdes.CreateDecryptor())
                {
                    var resultArray = transform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
                    return Encoding.UTF8.GetString(resultArray);
                }
            }
        }
    }
}
