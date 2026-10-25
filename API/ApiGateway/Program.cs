var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.MapGet("/", (IConfiguration config) =>
{
    var rows = config.GetSection("ReverseProxy:Routes").GetChildren()
        .Select(route =>
        {
            var clusterId = route["ClusterId"];
            var path = route.GetSection("Match")["Path"] ?? "";
            var address = config[$"ReverseProxy:Clusters:{clusterId}:Destinations:d1:Address"];

            if (address is null || !Uri.TryCreate(address, UriKind.Absolute, out var uri))
                return null;

            var serviceName = path.Split('/', StringSplitOptions.RemoveEmptyEntries).ElementAtOrDefault(1) ?? clusterId ?? "unknown";
            return new { ServiceName = serviceName, Route = path, Port = uri.Port };
        })
        .Where(row => row is not null)
        .Select(row => row!)
        .ToList();

    var tableRows = string.Join('\n', rows.Select(row =>
        $"""
            <tr>
                <td>{row.ServiceName}</td>
                <td><code>{row.Route}</code></td>
                <td>{row.Port}</td>
            </tr>
        """));

    var html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>RTN - API Gateway</title>
            <style>
                body { font-family: system-ui, sans-serif; margin: 2rem; }
                h1 { margin-bottom: 0.5rem; }
                table { border-collapse: collapse; margin-top: 1.5rem; }
                th, td { border: 1px solid #ccc; padding: 0.5rem 1rem; text-align: left; }
                th { background: #f5f5f5; }
            </style>
        </head>
        <body>
            <h1>RTN - API Gateway</h1>
            <h3>Multi-project REST API routing for local environment use only</h3>
            <p>List of proxied services and their destination ports</p>
            <table>
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Route</th>
                        <th>Port</th>
                    </tr>
                </thead>
                <tbody>
        """ + tableRows + """
                </tbody>
            </table>
            <br/>
            <p>Please refer to the README.md file for more information</p>
        </body>
        </html>
        """;

    return Results.Content(html, "text/html");
});

app.MapReverseProxy();
app.Run();

