using System.Text.Json;

namespace BlazorApp.Services;

/// <summary>
/// A tabular dataset returned by an API command.
/// </summary>
public sealed class ApiDataset
{
    public required string Name { get; init; }
    public required IReadOnlyList<string> Columns { get; init; }
    public required IReadOnlyList<IReadOnlyDictionary<string, string?>> Rows { get; init; }
}

/// <summary>
/// Converts each JSON object in ApiCommandResponse.Data into one or more tabular datasets.
/// Data entries may be JSON objects or strings containing JSON objects.
/// </summary>
public static class ApiDatasetParser
{
    public static IReadOnlyList<ApiDataset> Parse(ApiCommandResponse response) =>
        Parse(response.Data);

    /// <summary>
    /// Returns the records for one dataset, such as WORKORDER or WORKORDERPARAMETRICS.
    /// The result is empty when the response does not contain that name.
    /// </summary>
    public static ApiDataset Parse(ApiCommandResponse response, string datasetName) =>
        Parse(response.Data, datasetName);

    public static ApiDataset Parse(IEnumerable<JsonElement>? entries, string datasetName)
    {
        if (string.IsNullOrWhiteSpace(datasetName))
            throw new ArgumentException("Dataset name is required.", nameof(datasetName));

        foreach (var entry in entries ?? [])
        {
            var payload = Unwrap(entry);
            if (payload.ValueKind != JsonValueKind.Object)
                continue;

            foreach (var property in payload.EnumerateObject())
            {
                if (property.Value.ValueKind == JsonValueKind.Array &&
                    string.Equals(property.Name, datasetName, StringComparison.OrdinalIgnoreCase))
                {
                    return BuildDataset(property.Name, property.Value);
                }
            }
        }

        return new ApiDataset
        {
            Name = datasetName,
            Columns = [],
            Rows = []
        };
    }

    public static IReadOnlyList<ApiDataset> Parse(IEnumerable<JsonElement>? entries)
    {
        var datasets = new List<ApiDataset>();

        foreach (var entry in entries ?? [])
        {
            var payload = Unwrap(entry);
            if (payload.ValueKind != JsonValueKind.Object)
                continue;

            foreach (var property in payload.EnumerateObject())
            {
                if (property.Value.ValueKind == JsonValueKind.Array)
                    datasets.Add(BuildDataset(property.Name, property.Value));
            }
        }

        return datasets;
    }

    private static JsonElement Unwrap(JsonElement entry)
    {
        if (entry.ValueKind != JsonValueKind.String)
            return entry;

        var json = entry.GetString();
        if (string.IsNullOrWhiteSpace(json))
            return default;

        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }

    private static ApiDataset BuildDataset(string name, JsonElement items)
    {
        var columns = new List<string>();
        var rows = new List<IReadOnlyDictionary<string, string?>>();

        foreach (var item in items.EnumerateArray())
        {
            var row = ReadRow(item);
            rows.Add(row);

            foreach (var column in row.Keys)
            {
                if (!columns.Contains(column, StringComparer.OrdinalIgnoreCase))
                    columns.Add(column);
            }
        }

        return new ApiDataset
        {
            Name = name,
            Columns = columns,
            Rows = rows
        };
    }

    private static IReadOnlyDictionary<string, string?> ReadRow(JsonElement item)
    {
        var row = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

        if (item.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in item.EnumerateObject())
                row[property.Name] = FormatValue(property.Value);
        }
        else
        {
            row["Value"] = FormatValue(item);
        }

        return row;
    }

    private static string? FormatValue(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.Null or JsonValueKind.Undefined => null,
        JsonValueKind.String => value.GetString(),
        JsonValueKind.Object or JsonValueKind.Array => value.GetRawText(),
        _ => value.ToString()
    };
}
