using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
    
namespace RTN.Framework.Data
{
    public class CommandExecutor : ICommandExecutor
    {
        private readonly IDbExecutor _dbExecutor;
        private readonly RTN.Framework.Utilities.IRotatingLogger _logger;
        private static Dictionary<string, CommandDef> _commands;

        public CommandExecutor(string appDataFolder, IDbExecutor dbExecutor, RTN.Framework.Utilities.IRotatingLogger logger)
        {
            _dbExecutor = dbExecutor ?? throw new ArgumentNullException(nameof(dbExecutor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            if (_commands == null)
            {
                var appCommandsPath = Path.Combine(appDataFolder, "AppCommands.xml");
                _logger?.Log($"[{GetType().FullName}.{nameof(CommandExecutor)}] - Loading AppCommands.xml from '{appCommandsPath}'.");
                _commands = LoadCommands(appCommandsPath);
                _logger?.Log($"[{GetType().FullName}.{nameof(CommandExecutor)}] - Loaded AppCommands.xml from '{appCommandsPath}' with {_commands.Count} commands.");

                if (_commands.Count == 0)
                {
                    _logger?.Log($"[{GetType().FullName}.{nameof(CommandExecutor)}] - No commands found in AppCommands.xml.");                    
                    throw new Exception("No commands found in AppCommands.xml.");
                }
            }
        }

        /// <summary>
        /// Executes a command and returns JSON (default) or dynamic object based on outputtype in AppCommands.xml.
        /// </summary>
        public async Task<string> ExecuteCommandAsync(string commandId, object paramValues)
        {
            try
            {
                if (!_commands.TryGetValue(commandId, out var command))
                {
                    _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteCommandAsync)}] - CommandId '{commandId}' not found in AppCommands.xml.");
                    var errorObj = new DbExecutionResult { Status = "error", Message = $"Command '{commandId}' not found in AppCommands.xml.", Data = null };
                    return Newtonsoft.Json.JsonConvert.SerializeObject(errorObj);
                }

                var safeParams = paramValues ?? new System.Dynamic.ExpandoObject();
                var results = new List<object>();

                foreach (var action in command.Actions)
                {
                    object dataResult;
                    if (string.Equals(command.OutputType, "DDO", StringComparison.OrdinalIgnoreCase))
                    {
                        dataResult = await ExecuteCommandDynamicAsync(commandId, safeParams);
                    }
                    else
                    {
                        dataResult = await _dbExecutor.ExecuteActionAsync(action.BeanName, action.Transaction, action.Action, safeParams);
                    }
                    results.Add(dataResult);
                }

                var successObj = new DbExecutionResult { Status = "success", Message = string.Empty, Data = results };
                return Newtonsoft.Json.JsonConvert.SerializeObject(successObj);
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteCommandAsync)}] - Exception: {ex.Message}");
                var errorObj = new DbExecutionResult { Status = "error", Message = ex.Message, Data = null };
                return Newtonsoft.Json.JsonConvert.SerializeObject(errorObj);
            }
        }

        /// <summary>
        /// Executes a command and returns a dynamic object if outputtype is DDO, otherwise returns JSON string.
        /// </summary>
        public async Task<object> ExecuteCommandDynamicAsync(string commandId, object paramValues)
        {
            try
            {
                if (!_commands.TryGetValue(commandId, out var command))
                {
                    _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteCommandDynamicAsync)}] - CommandId '{commandId}' not found in AppCommands.xml.");
                    return new DbExecutionResult { Status = "error", Message = $"Command '{commandId}' not found in AppCommands.xml.", Data = null };
                }

                var safeParams = paramValues ?? new System.Dynamic.ExpandoObject();
                var results = new List<object>();

                foreach (var action in command.Actions)
                {
                    object dataResult;
                    var json = await _dbExecutor.ExecuteActionAsync(action.BeanName, action.Transaction, action.Action, safeParams);
                    dataResult = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                    results.Add(dataResult);
                }

                return new DbExecutionResult { Status = "success", Message = string.Empty, Data = results };
            }
            catch (Exception ex)
            {
                _logger?.Log($"[{GetType().FullName}.{nameof(ExecuteCommandDynamicAsync)}] - Exception: {ex.Message}");
                return new DbExecutionResult { Status = "error", Message = ex.Message, Data = null };
            }
        }
        
        private static Dictionary<string, CommandDef> LoadCommands(string xmlPath)
        {
            var commands = new Dictionary<string, CommandDef>(StringComparer.OrdinalIgnoreCase);
            if (!File.Exists(xmlPath))
                return commands;

            var doc = XDocument.Load(xmlPath);
            var root = doc.Root;

            foreach (var cmdElem in root.Elements("COMMAND"))
            {
                var id = (string)cmdElem.Attribute("id");
                var outputType = (string)cmdElem.Attribute("outputtype") ?? "";
                var actions = new List<CommandAction>();

                foreach (var actionElem in cmdElem.Elements("ACTION"))
                {
                    actions.Add(new CommandAction
                    {
                        BeanName = (string)actionElem.Attribute("beanname"),
                        Transaction = (string)actionElem.Attribute("transaction"),
                        Action = (string)actionElem.Attribute("action")
                    });
                }

                if (id != null && actions.Count > 0)
                {
                    commands[id] = new CommandDef { Id = id, Actions = actions, OutputType = outputType };
                }
            }
            return commands;
        }

        private class CommandDef
        {
            public string Id { get; set; }
            public List<CommandAction> Actions { get; set; } = new List<CommandAction>();
            public string OutputType { get; set; } // "JSON" or "DDO"
        }

        private class CommandAction
        {
            public string BeanName { get; set; }
            public string Transaction { get; set; }
            public string Action { get; set; }
        }
    }
}
