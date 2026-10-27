import invokeApi from './invokeApi';

// Preconfigured API instances
export const invokePartMasterReadPartQtyApi = () => invokeApi('POST', '/api/workorderservice/GETPARTIDVENDORLOT');

export const invokeValidatePartIdApi = () => invokeApi('POST', '/api/workorderservice/VALIDATEATTACHPARTID');

export const invokeReadWorkOrderTravelerApi = () => invokeApi('POST', '/api/travelerservice/GETWORKORDERTRAVELERINFO');

export const invokeGetTotalWipByOperationApi = () => invokeApi('POST', '/api/travelerservice/GETWIPTOTALBYOPERATION');

export const invokeGetDashboardTotalWipByOperationApi = () => invokeApi('POST', '/api/travelerservice/GETDASHBOARDWIPTOTALBYOPERATION');

export const invokeGetDashboardWorkOrderOperationYieldApi = () => invokeApi('POST', '/api/travelerservice/GETDASHBOARDYIELDANALYSISBYOPERATION');

export const invokeUpdateWorkOrderOperationCommentApi = () => invokeApi('POST', '/api/travelerservice/UPDATEWORKORDEROPERATIONCOMMENT');

export const invokeReadNonWipWorkOrderApi = () => invokeApi('POST', '/api/workorderservice/GETNONWIPWORKORDERNUMBERS');

export const invokeSubmitFmaBugzillaApi = () => invokeApi('POST', '/api/fmaservice/FmaBugzilla/submit');

export const invokeFmaGetReferenceApi = () => invokeApi('POST', '/api/fmaservice/FETCHFMAREFERENCE');

export const invokeUpdateWorkOrderOperationApi = () => invokeApi('POST', '/api/workorderservice/PROCESSWORKORDEROPERATIONCOMPLETEUPDATE');

export const invokeGetRouteOperationParametricApi = () => invokeApi('POST', '/api/workorderservice/GETROUTEOPERATIONPARAMETRIC');

export const invokeRewriteTextApi = () => invokeApi('POST', '/api/travelerservice/Rewrite/summarize-log');

export const invokeRewriteFmaDescriptionApi = () => invokeApi('POST', '/api/travelerservice/Rewrite/summarize-log');

export const invokeGetBomPartNumbersApi = () => invokeApi('POST', '/api/workorderservice/GETBOMPARTNUMBERS');

export const invokeGetBomPartNumbersMrsiPartsApi = () => invokeApi('POST', '/api/workorderservice/GETBOMPARTNUMBERMRSIPARTS');