using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using NokPa.Framework.Data;
using NokPa.Framework.Utilities;

namespace ApiTemplateService.Controllers
{
    [ApiController]
    [Route("")]
    public class ApiTemplateController : ControllerBase
    {
        private readonly CommandExecutor _commandExecutor;
        private readonly IRotatingLogger _logger;

        public ApiTemplateController(
            CommandExecutor commandExecutor,
            [FromKeyedServices("ui")] IRotatingLogger logger)
        {
            _commandExecutor = commandExecutor;
            _logger = logger;
        }

        private string GetAuthenticatedUser()
        {
            var identity = User.Identity;
            if (identity?.IsAuthenticated != true)
            {
                return "unauthenticated";
            }

            var name = identity.Name;
            if (string.IsNullOrWhiteSpace(name))
            {
                return "authenticated";
            }

            var separatorIndex = name.LastIndexOf('\\');
            return separatorIndex >= 0 && separatorIndex < name.Length - 1
                ? name[(separatorIndex + 1)..]
                : name;
        }

        [HttpGet("{commandId}")]
        public async Task<IActionResult> GetById(string commandId)
        {
            var user = GetAuthenticatedUser();
            _logger.Log($"[ApiTemplateService] GET request. User={user}, CommandId={commandId}");

            try
            {
                var result = await _commandExecutor.ExecuteCommandAsync(commandId, null);
                _logger.Log($"[ApiTemplateService] GET response. User={user}, CommandId={commandId}, Response={result}");
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                _logger.Log($"[ApiTemplateService] GET failed. User={user}, CommandId={commandId}, Error={ex}");
                throw;
            }
        }

        [HttpPost("{commandId}")]
        public async Task<IActionResult> Create(string commandId, [FromBody] System.Text.Json.JsonElement paramValues)
        {
            var user = GetAuthenticatedUser();
            var json = paramValues.GetRawText();
            _logger.Log($"[ApiTemplateService] POST request. User={user}, CommandId={commandId}, Request={json}");

            try
            {
                var jObject = Newtonsoft.Json.Linq.JObject.Parse(json);
                var result = await _commandExecutor.ExecuteCommandAsync(commandId, jObject);
                _logger.Log($"[ApiTemplateService] POST response. User={user}, CommandId={commandId}, Response={result}");
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                _logger.Log($"[ApiTemplateService] POST failed. User={user}, CommandId={commandId}, Error={ex}");
                throw;
            }
        }
    }
}
