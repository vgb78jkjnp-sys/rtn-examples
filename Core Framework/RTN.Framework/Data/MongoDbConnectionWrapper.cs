using MongoDB.Driver;
using RTN.Framework.Utilities;
using System;

namespace RTN.Framework.Data
{
    public class MongoDbConnectionWrapper
    {
        public IMongoClient Client { get; }
        public string ConnectionString { get; }
        public IRotatingLogger Logger { get; }

        public MongoDbConnectionWrapper(string connectionString, IRotatingLogger logger)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new ArgumentNullException(nameof(connectionString));

            ConnectionString = connectionString;
            Logger = logger;
            Client = new MongoClient(connectionString);

            Logger?.Log($"[{GetType().FullName}.{nameof(MongoDbConnectionWrapper)}] - Created MongoDB client.");
        }
    }
}