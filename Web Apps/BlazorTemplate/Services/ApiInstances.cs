namespace BlazorApp.Services;

/// <summary>
/// Preconfigured API instances. Each entry is the HTTP method and path used to call a service command.
/// </summary>
public static class ApiInstances
{
    public static readonly ApiEndpoint GetWorkOrderNumbers = new(HttpMethod.Post, "/api/workorderservice/GETWORKORDERNUMBERS");

    public static readonly ApiEndpoint GetPartIdVendorLot = new(HttpMethod.Post, "/api/workorderservice/GETPARTIDVENDORLOT");

    public static readonly ApiEndpoint ValidateAttachPartId = new(HttpMethod.Post, "/api/workorderservice/VALIDATEATTACHPARTID");

    public static readonly ApiEndpoint GetWorkOrderTravelerInfo = new(HttpMethod.Post, "/api/travelerservice/GETWORKORDERTRAVELERINFO");

    public static readonly ApiEndpoint GetWipTotalByOperation = new(HttpMethod.Post, "/api/travelerservice/GETWIPTOTALBYOPERATION");

    public static readonly ApiEndpoint GetDashboardWipTotalByOperation = new(HttpMethod.Post, "/api/travelerservice/GETDASHBOARDWIPTOTALBYOPERATION");

    public static readonly ApiEndpoint GetDashboardYieldAnalysisByOperation = new(HttpMethod.Post, "/api/travelerservice/GETDASHBOARDYIELDANALYSISBYOPERATION");

    public static readonly ApiEndpoint UpdateWorkOrderOperationComment = new(HttpMethod.Post, "/api/travelerservice/UPDATEWORKORDEROPERATIONCOMMENT");

    public static readonly ApiEndpoint GetNonWipWorkOrderNumbers = new(HttpMethod.Post, "/api/workorderservice/GETNONWIPWORKORDERNUMBERS");

    public static readonly ApiEndpoint SubmitFmaBugzilla = new(HttpMethod.Post, "/api/fmaservice/FmaBugzilla/submit");

    public static readonly ApiEndpoint FetchFmaReference = new(HttpMethod.Post, "/api/fmaservice/FETCHFMAREFERENCE");

    public static readonly ApiEndpoint ProcessWorkOrderOperationCompleteUpdate = new(HttpMethod.Post, "/api/workorderservice/PROCESSWORKORDEROPERATIONCOMPLETEUPDATE");

    public static readonly ApiEndpoint GetRouteOperationParametric = new(HttpMethod.Post, "/api/workorderservice/GETROUTEOPERATIONPARAMETRIC");

    public static readonly ApiEndpoint SummarizeLog = new(HttpMethod.Post, "/api/travelerservice/Rewrite/summarize-log");

    public static readonly ApiEndpoint GetBomPartNumbers = new(HttpMethod.Post, "/api/workorderservice/GETBOMPARTNUMBERS");

    public static readonly ApiEndpoint GetBomPartNumberMrsiParts = new(HttpMethod.Post, "/api/workorderservice/GETBOMPARTNUMBERMRSIPARTS");

    public static readonly ApiEndpoint ValidateMissingParts = new(HttpMethod.Post, "/api/workorderservice/VALIDATEMISSINGPARTS");
}

public sealed record ApiEndpoint(HttpMethod Method, string Path);
