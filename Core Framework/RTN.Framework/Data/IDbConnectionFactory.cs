namespace RTN.Framework.Data
{
    public interface IDbConnectionFactory
    {
        IDbConnectionWrapper Create(string providerName, string connectionString);
        /// <summary>
        /// Create a connection wrapper with an optional connection-string decryptor.
        /// </summary>
        IDbConnectionWrapper Create(string providerName, string connectionString, IConnectionStringDecryptor decryptor);
        MongoDbConnectionWrapper CreateMongo(string connectionString);
    }
}