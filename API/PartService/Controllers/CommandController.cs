using Microsoft.AspNetCore.Mvc;
using RTN.Framework.Data;

namespace PartService.Controllers;

[ApiController]
[Route("")]
public class CommandController : ControllerBase
{
    private readonly CommandExecutor _commandExecutor;

    public CommandController(CommandExecutor commandExecutor)
    {
        _commandExecutor = commandExecutor;
    }

    [HttpGet("{commandId}")]
    public async Task<IActionResult> GetById(string commandId)
    {
        var result = await _commandExecutor.ExecuteCommandAsync(commandId, null);
        return Content(result, "application/json");
    }

    [HttpPost("{commandId}")]
    public async Task<IActionResult> Create(string commandId, [FromBody] System.Text.Json.JsonElement paramValues)
    {
        var json = paramValues.GetRawText();
        var jObject = Newtonsoft.Json.Linq.JObject.Parse(json);
        var result = await _commandExecutor.ExecuteCommandAsync(commandId, jObject);
        return Content(result, "application/json");
    }
}
