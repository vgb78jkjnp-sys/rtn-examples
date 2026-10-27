using Microsoft.AspNetCore.Mvc;
using NokPa.Framework.Utilities;

namespace ApiTemplateService.Controllers;

[Route("[controller]")]
[ApiController]
public class HealthController : ControllerBase
{
    private readonly IRotatingLogger _logger;

    public HealthController(IRotatingLogger logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public IActionResult Get()
    {
        _logger.Log("[ApiTemplateService] Health check succeeded.");
        return Ok(new { status = "ok", service = "ApiTemplateService" });
    }
}
