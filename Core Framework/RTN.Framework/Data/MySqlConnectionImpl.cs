using System.Data;
using RTN.Framework.Utilities;

namespace RTN.Framework.Data
{
    public class MySqlConnectionImpl : DbConnectionBase
    {
        public MySqlConnectionImpl(string connectionString, IRotatingLogger logger)
            : base(connectionString, logger)
        {
        }

        public MySqlConnectionImpl(string connectionString, IRotatingLogger logger, IConnectionStringDecryptor decryptor)
            : base(connectionString, logger, decryptor)
        {
        }

        protected override IDbConnection CreateConnection()
        {
            return new MySql.Data.MySqlClient.MySqlConnection(ConnectionString);
        }
    }
}