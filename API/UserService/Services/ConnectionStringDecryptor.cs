using RTN.Framework.Data;

public class ConnectionStringDecryptor : IConnectionStringDecryptor
{
    private readonly Func<string, string> _decryptFunc;
    public ConnectionStringDecryptor(Func<string, string> decryptFunc) => _decryptFunc = decryptFunc;
    public string Decrypt(string cipher) => _decryptFunc(cipher);
}