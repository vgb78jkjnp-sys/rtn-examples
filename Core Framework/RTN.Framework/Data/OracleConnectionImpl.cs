using System.Data;
using RTN.Framework.Utilities;

namespace RTN.Framework.Data
{
    public class OracleConnectionImpl : DbConnectionBase
    {
        public OracleConnectionImpl(string connectionString, IRotatingLogger logger)
            : base(connectionString, logger)
        {
        }

        public OracleConnectionImpl(string connectionString, IRotatingLogger logger, IConnectionStringDecryptor decryptor)
            : base(connectionString, logger, decryptor)
        {
        }

        protected override IDbConnection CreateConnection()
        {
            return new Oracle.ManagedDataAccess.Client.OracleConnection(ConnectionString);
        }
    }
}