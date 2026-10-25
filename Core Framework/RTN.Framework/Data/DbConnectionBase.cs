using System;
using System.Data;
using System.Data.Common;

namespace RTN.Framework.Data
{

    public abstract class DbConnectionBase : IDbConnectionWrapper
    {
        protected string ConnectionString { get; }
        protected IDbConnection Connection { get; private set; }
        protected RTN.Framework.Utilities.IRotatingLogger Logger { get; }

        protected DbConnectionBase(string connectionString, RTN.Framework.Utilities.IRotatingLogger logger, Func<string, string> decryptor = null)
        {
            try
            {
                if (decryptor != null)
                {
                    ConnectionString = decryptor(connectionString);
                }
                else
                {
                    // If no decryptor provided, try CryptorEngine.Decrypt when the value appears to be encrypted (base64)
                    try
                    {
                        // Attempt to detect base64 and decrypt; if anything fails, fall back to the original string
                        Convert.FromBase64String(connectionString);
                        ConnectionString = CryptorEngine.Decrypt(connectionString);
                    }
                    catch
                    {
                        ConnectionString = connectionString;
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to decrypt connection string.", ex);
            }

            Logger = logger;
            Connection = CreateConnection();
        }

        /// <summary>
        /// Constructor that accepts a DI-friendly decryptor implementation.
        /// </summary>
        protected DbConnectionBase(string connectionString, RTN.Framework.Utilities.IRotatingLogger logger, IConnectionStringDecryptor decryptor)
            : this(connectionString, logger, decryptor != null ? new Func<string, string>(decryptor.Decrypt) : null)
        {
        }

        protected abstract IDbConnection CreateConnection();

        public IDbConnection DbConnection => Connection;

        public virtual void Open()
        {
            if (Connection.State != ConnectionState.Open)
            {
                Logger?.Log($"[{GetType().FullName}.{nameof(Open)}] - Attempting to open connection {MaskConnectionString(ConnectionString)}.");
                try
                {
                    Connection.Open();
                    Logger?.Log($"[{GetType().FullName}.{nameof(Open)}] - Successfully opened connection {MaskConnectionString(ConnectionString)}.");
                }
                catch (Exception ex)
                {
                    Logger?.Log($"[{GetType().FullName}.{nameof(Open)}] - Error opening connection {MaskConnectionString(ConnectionString)}: {ex.Message}.");
                    throw;
                }
            }
        }

        public virtual void Close()
        {
            if (Connection.State != ConnectionState.Closed)
            {
                Logger?.Log($"[{GetType().FullName}.{nameof(Close)}] - Attempting to close connection {MaskConnectionString(ConnectionString)}.");
                try
                {
                    Connection.Close();
                    Logger?.Log($"[{GetType().FullName}.{nameof(Close)}] - Successfully closed connection {MaskConnectionString(ConnectionString)}.");
                }
                catch (Exception ex)
                {
                    Logger?.Log($"[{GetType().FullName}.{nameof(Close)}] - Error closing connection {MaskConnectionString(ConnectionString)}: {ex.Message}.");
                    throw;
                }
            }
        }

        public void Dispose()
        {
            if (Connection != null)
            {
                Logger?.Log($"[{GetType().FullName}.{nameof(Dispose)}] - Attempting to dispose connection {MaskConnectionString(ConnectionString)}.");
                try
                {
                    Connection.Dispose();
                    Logger?.Log($"[{GetType().FullName}.{nameof(Dispose)}] - Successfully disposed connection {MaskConnectionString(ConnectionString)}.");
                }
                catch (Exception ex)
                {
                    Logger?.Log($"[{GetType().FullName}.{nameof(Dispose)}] - Error disposing connection {MaskConnectionString(ConnectionString)}: {ex.Message}"); 
                    throw;
                }
                Connection = null;
            }
        }

        private static string MaskConnectionString(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                return string.Empty;

            try
            {
                var parts = connectionString.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
                for (int i = 0; i < parts.Length; i++)
                {
                    var idx = parts[i].IndexOf('=');
                    if (idx <= 0)
                        continue;
                    var key = parts[i].Substring(0, idx).Trim().ToLowerInvariant();
                    if (key.Contains("password") || key.Contains("pwd") || key.Contains("pass"))
                    {
                        parts[i] = parts[i].Substring(0, idx + 1) + "*****";
                    }
                }
                return string.Join(";", parts) + (connectionString.EndsWith(";") ? ";" : string.Empty);
            }
            catch
            {
                return "*****";
            }
        }

        public class NoOpConnectionStringDecryptor : IConnectionStringDecryptor
        {
            public string Decrypt(string encrypted)
            {
                return encrypted;
            }
        }
    }
}
