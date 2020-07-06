import callApi from "../../common/callApi";

export const VICE_ADMIN_QUERY_KEY = "fetchViceAdmin";
export const ASYNC_DATA_QUERY_KEY = "fetchAsyncData";

export const asyncData = (_key, externalID) =>
    callApi({
        endpoint: `/api/admin/vice/async-data?external-id=${externalID}`,
        method: "GET",
    });

export const getTimeLimit = ({ analysisID }) =>
    callApi({
        endpoint: `/api/admin/vice/analyses/${analysisID}/time-limit`,
        method: "GET",
    });

export const extendTimeLimit = ({ analysisID }) =>
    callApi({
        endpoint: `/api/admin/vice/analyses/${analysisID}/time-limit`,
        method: "POST",
    });

export const externalID = ({ analysisID }) =>
    callApi({
        endpoint: `/api/admin/vice/analyses/${analysisID}/external-id`,
        method: "GET",
    });

export const exit = ({ analysisID }) =>
    callApi({
        endpoint: `/api/admin/vice/analyses/${analysisID}/exit`,
        method: "POST",
    });

export const saveAndExit = ({ analysisID }) =>
    callApi({
        endpoint: `/api/admin/vice/analyses/${analysisID}/save-and-exit`,
        method: "POST",
    });

export const saveOutputFiles = ({ analysisID }) =>
    callApi({
        endpoint: `/api/admin/vice/analyses/${analysisID}/save-output-files`,
        method: "POST",
    });

export const downloadInputFiles = ({ analysisID }) =>
    callApi({
        endpoint: `/api/admin/vice/analyses/${analysisID}/download-input-files`,
        method: "POST",
    });

export default () =>
    callApi({
        endpoint: "/api/admin/vice/resources",
        method: "GET",
    });
