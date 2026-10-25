using Microsoft.AspNetCore.Mvc;
using RTN.Framework.Utilities;

namespace UserService.Controllers;

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
        _logger.Log("[User API Service] Health check succeeded.");
        return Ok(new { status = "ok", service = "UserService" });
    }
}
