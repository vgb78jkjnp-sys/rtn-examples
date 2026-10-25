using System.Data;
using RTN.Framework.Utilities;

namespace RTN.Framework.Data
{
    public class SqlServerConnectionImpl : DbConnectionBase
    {
        public SqlServerConnectionImpl(string connectionString, IRotatingLogger logger)
            : base(connectionString, logger)
        {
        }

        public SqlServerConnectionImpl(string connectionString, IRotatingLogger logger, IConnectionStringDecryptor decryptor)
            : base(connectionString, logger, decryptor)
        {
        }

        protected override IDbConnection CreateConnection()
        {
            return new Microsoft.Data.SqlClient.SqlConnection(ConnectionString);
        }
    }
}