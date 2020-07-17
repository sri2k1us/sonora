import callApi from "../common/callApi";

export const REFERENCE_GENOMES_QUERY_KEY = "referenceGenomesKey";
export const ADMIN_REFERENCE_GENOMES_QUERY_KEY = "adminReferenceGenomesKey";


/**
 * Get the current listing of Reference Genomes.
 *
 * @returns {Promise<any>}
 */
export const getReferenceGenomes = () => {
    return callApi({
        endpoint: "/api/reference-genomes",
    });
};

export const getAdminReferenceGenomes = () => {
    return callApi({
        endpoint: "/api/admin/reference-genomes?deleted=true",
        method: "GET",
    });
};
