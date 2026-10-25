namespace RTN.Framework.Data
{
    /// <summary>
    /// Abstraction for connection-string decryptors so callers can provide a DI-friendly implementation.
    /// </summary>
    public interface IConnectionStringDecryptor
    {
        /// <summary>
        /// Decrypt an encrypted connection string and return the plaintext connection string.
        /// </summary>
        /// <param name="encrypted">The encrypted connection string.</param>
        /// <returns>The decrypted connection string.</returns>
        string Decrypt(string encrypted);
    }
}
