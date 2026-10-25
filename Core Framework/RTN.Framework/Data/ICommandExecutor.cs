using System.Threading.Tasks;

namespace RTN.Framework.Data
{
    public interface ICommandExecutor
    {
        /// <summary>
        /// Executes a command defined in AppCommands.xml by commandId, mapping to the appropriate DataBean, Transaction, and Action.
        /// </summary>
        /// <param name="commandId">The COMMAND id from AppCommands.xml.</param>
        /// <param name="paramValues">The parameter object for the action.</param>
        /// <returns>The result as a JSON string.</returns>
        Task<string> ExecuteCommandAsync(string commandId, object paramValues);
    }
}