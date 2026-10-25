using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Server.IISIntegration;
using RTN.Framework.Authentication;
using RTN.Framework.Data;
using RTN.Framework.Utilities;

var builder = WebApplication.CreateBuilder(args);

var pathBase = builder.Configuration["PathBase"];

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var appDataFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "App_Data");

builder.Services.AddSingleton<IUserAuthenticator>(sp =>
    new UserAuthenticator(
        sp.GetRequiredService<IDbExecutor>(),
        sp.GetRequiredService<IRotatingLogger>()
    )
);

builder.Services.AddSingleton<IRotatingLogger>(sp =>
    new RotatingLogger(
        logDirectory: Path.Combine(appDataFolder, "logs"),
        logFileName: "part-service.log",
        maxFileSizeBytes: 1024 * 1024,
        maxBackupFiles: 5
    )
);

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

builder.Services.AddSingleton<CommandExecutor>(sp =>
    new CommandExecutor(
        appDataFolder,
        sp.GetRequiredService<IDbExecutor>(),
        sp.GetRequiredService<IRotatingLogger>()
    )
);

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

var app = builder.Build();

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

app.MapControllers();

app.Run();
