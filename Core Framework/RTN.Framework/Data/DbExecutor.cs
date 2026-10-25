using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace RTN.Framework.Data
{
public class DbExecutor : IDbExecutor
    {
        private static Dictionary<string, DataBean> _dataBeans;

        private readonly Func<string, IDbConnectionWrapper> _connectionFactory;
        private readonly RTN.Framework.Utilities.IRotatingLogger _logger;

        public DbExecutor(string appDataFolder, Func<string, IDbConnectionWrapper> connectionFactory, RTN.Framework.Utilities.IRotatingLogger logger)
        {
            _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            if (_dataBeans == null)
            {
                LoadAllBeans(appDataFolder);
            }
            if (_dataBeans.Count == 0)
            {
                _logger.Log($"[{GetType().FullName}.{nameof(DbExecutor)}] - No DataBeans found in App_Data.");
                throw new Exception("No DataBeans found in App_Data.");
            }
            _logger?.Log($"[{GetType().FullName}.{nameof(DbExecutor)}] - Constructed with appDataFolder='{appDataFolder}'.");
        }

        private void LoadAllBeans(string appDataFolder)
        {
            var absoluteFolder = appDataFolder + "\\BEAN-INF";
            if (!System.IO.Path.IsPathRooted(appDataFolder))
                absoluteFolder = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, appDataFolder);

            _logger?.Log($"[{GetType().FullName}.{nameof(LoadAllBeans)}] Loading beans from '{absoluteFolder}'...");

            _dataBeans = new Dictionary<string, DataBean>(StringComparer.OrdinalIgnoreCase);
            try
            {
                foreach (var file in System.IO.Directory.GetFiles(absoluteFolder, "*.xml"))
                {
                    try
                    {
                        _logger?.Log($"[{GetType().FullName}.{nameof(LoadAllBeans)}] - Loading bean from file: {file}");
                        var bean = XmlBeanReader.ReadBean(file);

                        if (!_dataBeans.ContainsKey(bean.Name))
                            _dataBeans.Add(bean.Name, bean);
                    }
                    catch (Exception ex)
                    {
                        _logger?.Log($"[{GetType().FullName}.{nameof(LoadAllBeans)}] - Error loading bean from '{file}': {ex.Message}");
                        // Optionally continue loading other files
                    }
                }
                _logger?.Log($"[{GetType().FullName}.{nameof(LoadAllBeans)}] Loaded {_dataBeans.Count} beans.");
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(LoadAllBeans)}] - Critical error loading beans from folder '{absoluteFolder}': {ex.Message}");
                throw new Exception($"Error loading beans from folder '{absoluteFolder}': {ex.Message}", ex);
            }
        }

        public DataBean GetDataBean(string name)
        {
            try
            {
                if (_dataBeans.TryGetValue(name, out var bean))
                {
                    _logger?.Log($"[{GetType().FullName}.{nameof(GetDataBean)}] - Successfully retrieved DataBean '{name}'.");
                    return bean;
                }
                else
                {
                    _logger?.Log($"[{GetType().FullName}.{nameof(GetDataBean)}] - DataBean '{name}' not found.");
                    throw new Exception($"DataBean '{name}' not found.");
                }
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(GetDataBean)}] - Exception retrieving DataBean '{name}': {ex.Message}");
                throw;
            }
        }

        public async Task<Dictionary<string, string>> ExecuteTransactionAsync(string dataBeanName, string transactionName, object paramValues)
        {
            try
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteTransactionAsync)}] - START: bean='{dataBeanName}', transaction='{transactionName}', paramValues={JsonConvert.SerializeObject(paramValues)}");
                var dataBean = GetDataBean(dataBeanName);
                var transaction = dataBean.Transactions.Find(t => t.Name == transactionName);

                if (transaction == null)
                {
                    _logger.Log($"[{GetType().FullName}.{nameof(ExecuteTransactionAsync)}] - Transaction '{transactionName}' not found in DataBean '{dataBeanName}'.");
                    throw new Exception($"Transaction '{transactionName}' not found.");
                }

                var results = new Dictionary<string, string>();

                using (var connection = _connectionFactory(dataBean.DataSource))
                {
                    var sqlConn = (Microsoft.Data.SqlClient.SqlConnection)connection.DbConnection;

                    try
                    {
                        await sqlConn.OpenAsync();
                        foreach (var action in transaction.Actions)
                        {
                            var parameters = new DynamicParameters();
                            // Build parameter string
                            var paramList = new List<string>();
                            foreach (var param in action.Parameters)
                            {
                                var value = paramValues.GetType().GetProperty(param.Name)?.GetValue(paramValues, null);
                                parameters.Add(param.Name, value);
                                paramList.Add($"{param.Name}={value}");
                            }
                            string paramString = string.Join(", ", paramList);

                            // Determine procName if type is 'P'
                            string procName = null;
                            if (string.Equals(action.Type, "P", StringComparison.OrdinalIgnoreCase))
                                procName = action.Statement.Split('(')[0];

                            // Log details
                            _logger?.Log(
                                $"[{GetType().FullName}.{nameof(ExecuteTransactionAsync)}] " +
                                $"Action='{action.Name}', ProcName='{procName}', Type='{action.Type}', Statement='{action.Statement}', Parameters=[{paramString}]"
                            );

                            object queryResult;
                            var sw = System.Diagnostics.Stopwatch.StartNew();
                            if (string.Equals(action.Type, "P", StringComparison.OrdinalIgnoreCase))
                            {
                                procName = action.Statement.Split('(')[0];
                                queryResult = await sqlConn.QueryAsync(procName, parameters, commandType: CommandType.StoredProcedure);
                            }
                            else if (string.Equals(action.Type, "S", StringComparison.OrdinalIgnoreCase))
                            {
                                queryResult = await sqlConn.QueryAsync(action.Statement, parameters, commandType: CommandType.Text);
                            }
                            else
                            {
                                throw new Exception($"Unknown action type '{action.Type}' for action '{action.Name}'.");
                            }
                            sw.Stop();
                            _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteTransactionAsync)}] - Dapper execution for action '{action.Name}' (type '{action.Type}') took {sw.ElapsedMilliseconds} ms.");
                            string json = JsonConvert.SerializeObject(queryResult);
                            results[action.Name] = json;
                        }
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteTransactionAsync)}] - SUCCESS: bean='{dataBeanName}', transaction='{transactionName}'");
                    }
                    catch (Exception ex)
                    {
                        _logger.Log($"[{GetType().FullName}.{nameof(ExecuteTransactionAsync)}] - Exception executing transaction '{transactionName}' on bean '{dataBeanName}': {ex.Message} StackTrace: {ex.StackTrace}");
                        throw new Exception($"Error executing transaction '{transactionName}': {ex.Message}", ex);
                    }
                    finally
                    {
                        if (sqlConn.State != System.Data.ConnectionState.Closed)
                        {
                            sqlConn.Close();
                        }
                    }
                }
                return results;
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteTransactionAsync)}] - Exception: {ex.Message} StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<string> ExecuteActionAsync(string dataBeanName, string transactionName, string actionName, object paramValues)
        {
            try
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - START: bean='{dataBeanName}', transaction='{transactionName}', action='{actionName}', paramValues={JsonConvert.SerializeObject(paramValues)}");
                var dataBean = GetDataBean(dataBeanName);

                var transaction = dataBean.Transactions.Find(t => t.Name == transactionName);
                if (transaction == null)
                {
                    _logger.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Transaction '{transactionName}' not found in DataBean '{dataBeanName}'.");
                    throw new Exception($"Transaction '{transactionName}' not found.");
                }

                var action = transaction.Actions.Find(a => string.Equals(a.Name, actionName, StringComparison.OrdinalIgnoreCase));
                if (action == null)
                {
                    _logger.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Action '{actionName}' not found in Transaction '{transactionName}' of DataBean '{dataBeanName}'.");
                    throw new Exception($"Action '{actionName}' not found.");
                }

                var parameters = new DynamicParameters();
                var paramList = new List<string>();
                foreach (var param in action.Parameters)
                {

                    object value = null;                    
                    if (paramValues is Newtonsoft.Json.Linq.JObject jObj)
                    {
                        value = jObj[param.Name]?.ToObject<object>();
                    }
                    else if (paramValues is string s && s.TrimStart().StartsWith("{"))
                    {
                        // If paramValues is a JSON string, parse it
                        var jObj2 = Newtonsoft.Json.Linq.JObject.Parse(s);
                        value = jObj2[param.Name]?.ToObject<object>();
                    }
                    else
                    {
                        value = paramValues.GetType().GetProperty(param.Name)?.GetValue(paramValues, null);
                    }

                    // Handle special parameter types
                    if (param.Type == "LST")
                    {
                        if (value is string strVal)
                            value = strVal.Split(',').Select(s => s.Trim()).ToList();
                    }
                    else if (param.Type == "DTM")
                    {
                        if (value is string strVal && DateTime.TryParse(strVal, out var dt))
                            value = dt;
                    }
                    else if (param.Type == "DBL")
                    {
                        if (value is string strVal && double.TryParse(strVal, out var dbl))
                            value = dbl;
                    }
                    else if (param.Type == "XML")
                    {
                        if (value != null)
                        {
                            parameters.Add(param.Name, value.ToString(), DbType.Xml);
                            paramList.Add($"{param.Name}={value}");
                            continue;
                        }
                    }

                    parameters.Add(param.Name, value);
                    paramList.Add($"{param.Name}={value}");
                }
                string paramString = string.Join(", ", paramList);
                string procName = null;
                if (string.Equals(action.Type, "P", StringComparison.OrdinalIgnoreCase))
                    procName = action.Statement.Split('(')[0];
                _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] Action='{action.Name}', ProcName='{procName}', Type='{action.Type}', Statement='{action.Statement}', Parameters=[{paramString}]");
                object queryResult = null;

                using (var connection = _connectionFactory(dataBean.DataSource))
                {
                    System.Data.Common.DbConnection sqlConn;

                    if (connection is SqlServerConnectionImpl)
                    {
                        sqlConn = (Microsoft.Data.SqlClient.SqlConnection)connection.DbConnection;
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Using SQL Server connection for DataSource '{dataBean.DataSource}'.");
                    }
                    else if (connection is MySqlConnectionImpl)
                    {
                        sqlConn = (MySql.Data.MySqlClient.MySqlConnection)connection.DbConnection;
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Using MySQL connection for DataSource '{dataBean.DataSource}'.");                    
                    }
                    else if (connection is OracleConnectionImpl)
                    {
                        sqlConn = (Oracle.ManagedDataAccess.Client.OracleConnection)connection.DbConnection;
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Using Oracle connection for DataSource '{dataBean.DataSource}'.");
                    }
                    else if (connection is MongoDbConnectionWrapper)
                    {
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Using MongoDB connection for DataSource '{dataBean.DataSource}'.");
                        throw new NotSupportedException("MongoDB is not supported in this method.");
                    }
                    else
                    {
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Unsupported connection type '{connection.GetType().FullName}' for DataSource '{dataBean.DataSource}'.");
                        throw new Exception($"Unsupported connection type '{connection.GetType().FullName}' for DataSource '{dataBean.DataSource}'.");
                    }

                    try
                    {
                        await sqlConn.OpenAsync();
                        var sw = System.Diagnostics.Stopwatch.StartNew();
                        if (string.Equals(action.Type, "P", StringComparison.OrdinalIgnoreCase))
                        {
                            procName = action.Statement.Split('(')[0];
                            queryResult = await sqlConn.QueryAsync(procName, parameters, commandType: CommandType.StoredProcedure);
                        }
                        else if (string.Equals(action.Type, "S", StringComparison.OrdinalIgnoreCase))
                        {
                            queryResult = await sqlConn.QueryAsync(action.Statement, parameters, commandType: CommandType.Text);
                        }
                        else
                        {
                            _logger.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Unknown action type '{action.Type}' for action '{action.Name}'.");
                            throw new Exception($"Unknown action type '{action.Type}' for action '{action.Name}'.");
                        }
                        sw.Stop();
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Dapper execution for action '{action.Name}' (type '{action.Type}') took {sw.ElapsedMilliseconds} ms.");
                        _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - SUCCESS: bean='{dataBeanName}', transaction='{transactionName}', action='{actionName}'");
                    }
                    catch (Exception ex)
                    {
                        _logger.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Exception executing action '{actionName}' in transaction '{transactionName}' on bean '{dataBeanName}': {ex.Message} StackTrace: {ex.StackTrace}");
                        throw new Exception($"Error executing action '{actionName}': {ex.Message}", ex);
                    }
                    finally
                    {
                        if (sqlConn.State != System.Data.ConnectionState.Closed)
                        {
                            sqlConn.Close();
                        }
                    }
                }
                //return JsonConvert.SerializeObject(queryResult);
                // Wrap the result in a JSON object with the transaction name as the property name
                var resultObject = JsonConvert.DeserializeObject(queryResult == null ? "null" : JsonConvert.SerializeObject(queryResult));
                var wrapped = new Dictionary<string, object>
                {
                    { transactionName, resultObject }
                };
                return JsonConvert.SerializeObject(wrapped);
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteActionAsync)}] - Exception: {ex.Message} StackTrace: {ex.StackTrace}");
                throw;
            }
        }

        public void Dispose()
        {
            // No unmanaged resources to dispose in this implementation
        }
    }

    // DataBean, Transaction, ActionDef, Parameter, XmlBeanReader classes as previously defined
    public class Parameter
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
    }

    public class ActionDef
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Statement { get; set; }
        public List<Parameter> Parameters { get; set; }
    }

    public class Transaction
    {
        public string Name { get; set; }
        public List<ActionDef> Actions { get; set; }
    }

    public class DataBean
    {
        public string Name { get; set; }
        public string DataSource { get; set; }
        public List<Transaction> Transactions { get; set; }
    }

    public static class XmlBeanReader
    {
        public static DataBean ReadBean(string xmlPath)
        {
            var doc = XDocument.Load(xmlPath);
            var beanElem = doc.Root;

            var dataBean = new DataBean
            {
                Name = (string)beanElem.Attribute("NAME"),
                DataSource = (string)beanElem.Attribute("DATASOURCE"),
                Transactions = new List<Transaction>()
            };

            foreach (var transElem in beanElem.Element("TRANSACTIONS").Elements("TRANSACTION"))
            {
                var transaction = new Transaction
                {
                    Name = (string)transElem.Attribute("NAME"),
                    Actions = new List<ActionDef>()
                };

                foreach (var actionElem in transElem.Element("ACTIONS").Elements("ACTION"))
                {
                    var action = new ActionDef
                    {
                        Name = (string)actionElem.Attribute("NAME"),
                        Type = (string)actionElem.Attribute("TYPE"),
                        Statement = (string)actionElem.Element("STATEMENT"),
                        Parameters = new List<Parameter>()
                    };

                    foreach (var paramElem in actionElem.Element("PARAMETERS").Elements("PARAMETER"))
                    {
                        action.Parameters.Add(new Parameter
                        {
                            Id = (string)paramElem.Attribute("ID"),
                            Name = (string)paramElem.Attribute("NAME"),
                            Type = (string)paramElem.Attribute("TYPE")
                        });
                    }

                    transaction.Actions.Add(action);
                }

                dataBean.Transactions.Add(transaction);
            }

            return dataBean;
        }
    }

}
