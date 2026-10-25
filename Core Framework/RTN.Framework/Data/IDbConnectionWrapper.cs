using System;
using System.Data;

namespace RTN.Framework.Data
{
    public interface IDbConnectionWrapper : IDisposable
    {
        IDbConnection DbConnection { get; }
        void Open();
        void Close();
    }
}
