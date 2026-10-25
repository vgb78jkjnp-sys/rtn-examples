using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RTN.Framework.Data
{
    public interface IDbExecutor : IDisposable
    {
        DataBean GetDataBean(string name);
        Task<Dictionary<string, string>> ExecuteTransactionAsync(string dataBeanName, string transactionName, object paramValues);
        Task<string> ExecuteActionAsync(string dataBeanName, string transactionName, string actionName, object paramValues);
    }
}
