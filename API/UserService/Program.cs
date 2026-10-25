using System.Xml.Linq;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Server.IISIntegration;
using RTN.Framework.Authentication;
using RTN.Framework.Data;
using RTN.Framework.Utilities;
//using UserService.Configuration;
//using UserService.Services;

var builder = WebApplication.CreateBuilder(args);

var pathBase = builder.Configuration["PathBase"];

//builder.WebHost.ConfigureKestrel(options =>
//{
//    options.ListenAnyIP(5291);
//});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var appDataFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "App_Data");

// Register User Authentication
builder.Services.AddSingleton<IUserAuthenticator>(sp =>
    new UserAuthenticator(
        sp.GetRequiredService<IDbExecutor>(),
        sp.GetRequiredService<IRotatingLogger>()
    )
);

// Register RotatingLogger
builder.Services.AddSingleton<IRotatingLogger>(sp =>
    new RotatingLogger(
        logDirectory: Path.Combine(appDataFolder, "logs"),
        logFileName: "user-service.log",
        maxFileSizeBytes: 1024 * 1024,                              // 1 MB
        maxBackupFiles: 5                                           // Number of backup files
    )
);

// Register DbConnectionFactory
builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

builder.Services.AddSingleton<IDbExecutor>(sp =>
    new DbExecutor(
        appDataFolder,
        connectionFactory: name =>
        {
            var connectionString = builder.Configuration.GetConnectionString(name);
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException($"Connection string '{name}' was not found.");

            var factory = sp.GetRequiredService<IDbConnectionFactory>();
            return factory.Create("sqlserver", connectionString);
        },
        logger: sp.GetRequiredService<IRotatingLogger>()
    )
);

// Register CommandExecutor
builder.Services.AddSingleton<CommandExecutor>(sp =>
    new CommandExecutor(
        appDataFolder,
        sp.GetRequiredService<IDbExecutor>(),
        sp.GetRequiredService<IRotatingLogger>()
    )
);

// Allow CORS for all origins, methods, and headers (for testing purposes, adjust as needed for production)
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins(allowedOrigins ?? Array.Empty<string>())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()); 
});

var useIisAuth = builder.Configuration.GetValue<bool>("Authentication:UseIisAuth");

if (useIisAuth || builder.Configuration.GetValue<bool>("ForwardedHeaders:Enabled"))
{
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    });
}

if (useIisAuth)
{
    builder.Services.AddAuthentication(IISDefaults.AuthenticationScheme);
}
else
{
    builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
        .AddNegotiate();
}

builder.Services.AddAuthorization();


// add authentication
//if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_IIS_HTTPAUTH")))
//{
//    builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
//        .AddNegotiate();
//}
//else
//{
//    builder.Services.AddAuthentication(Microsoft.AspNetCore.Server.IISIntegration.IISDefaults.AuthenticationScheme);
//}

//builder.Services.AddAuthorization();

var app = builder.Build();

if (useIisAuth || builder.Configuration.GetValue<bool>("ForwardedHeaders:Enabled"))
    app.UseForwardedHeaders();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!string.IsNullOrWhiteSpace(pathBase))
{
    app.UsePathBase(pathBase);
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// This is a generic implementation of end points but here only for reference purposes
//
//var xmlPath = "App_Data/ApiEndPoints.xml";
//if (File.Exists(xmlPath))
//{
//    var doc = XDocument.Load(xmlPath);
//    var ids = doc.Descendants("ENDPOINT")
//                 .Select(e => (string)e.Attribute("id"))
//                 .Where(id => !string.IsNullOrEmpty(id));
//    foreach (var id in ids)
//    {   
//        // GET /api/{id}
//        app.MapGet($"/api/{id}", () => Results.Ok(new { id }));

//        // POST /api/{id}
//        app.MapPost($"/api/{id}", (HttpRequest request) => Results.Ok(new { id, message = "POST received" }));

//        // GET /api/{id}/{commandid}
//        app.MapGet($"/api/{id}/{{commandid}}", (string commandid) => Results.Ok(new { id, commandid }));
//    }
//}

app.MapControllers();

app.Run();
