using System;
using RTN.Framework.Utilities;

namespace RTN.Framework.Data
{
    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly IRotatingLogger _logger;

        public DbConnectionFactory(IRotatingLogger logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public IDbConnectionWrapper Create(string providerName, string connectionString)
        {
            return Create(providerName, connectionString, null);
        }

        public IDbConnectionWrapper Create(string providerName, string connectionString, IConnectionStringDecryptor decryptor)
        {
            if (string.IsNullOrWhiteSpace(providerName))
                throw new ArgumentNullException(nameof(providerName));

            if (string.IsNullOrWhiteSpace(connectionString))
                throw new ArgumentNullException(nameof(connectionString));
            if (string.Equals(providerName, "sqlserver", StringComparison.OrdinalIgnoreCase))
                return decryptor != null
                    ? new SqlServerConnectionImpl(connectionString, _logger, decryptor)
                    : new SqlServerConnectionImpl(connectionString, _logger);

            if (string.Equals(providerName, "mysql", StringComparison.OrdinalIgnoreCase))
                return decryptor != null
                    ? new MySqlConnectionImpl(connectionString, _logger, decryptor)
                    : new MySqlConnectionImpl(connectionString, _logger);

            if (string.Equals(providerName, "oracle", StringComparison.OrdinalIgnoreCase))
                return decryptor != null
                    ? new OracleConnectionImpl(connectionString, _logger, decryptor)
                    : new OracleConnectionImpl(connectionString, _logger);

            throw new NotSupportedException($"Provider '{providerName}' is not supported.");
        }

        public MongoDbConnectionWrapper CreateMongo(string connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new ArgumentNullException(nameof(connectionString));

            return new MongoDbConnectionWrapper(connectionString, _logger);
        }
    }
}