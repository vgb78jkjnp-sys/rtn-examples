public class DbExecutionResult
{
    public string Status { get; set; } // "success" or "error"
    public string Message { get; set; } // Optional: error or info message
    public object Data { get; set; } // The actual result
}