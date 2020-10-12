/**
 * @author sriram, aramsey
 *
 */
import React, { useCallback } from "react";
import { useTranslation } from "i18n";
import { useRouter } from "next/router";

import constants from "../../../constants";

import { getLocalStorage } from "components/utils/localStorage";
import viewerConstants from "components/data/viewers/constants";
import Listing from "components/data/listing/Listing";
import { getEncodedPath } from "components/data/utils";
import FileViewer from "components/data/viewers/FileViewer";
import infoTypes from "components/models/InfoTypes";
import ResourceTypes from "components/models/ResourceTypes";
import dataFields from "components/data/dataFields";

/**
 * This variable value needs to match the name of this file for the routing to work
 * properly without doing a hard refresh.
 *
 * See https://nextjs.org/docs/api-reference/next/router#usage and
 * https://nextjs.org/docs/api-reference/next/link#dynamic-routes
 * @type {string}
 */
const dynamicPathName = "/[...pathItems]";

/**
 *
 * Handle routing to /data/ds/pathInDataStore
 *
 */
export default function DataStore() {
    const { t } = useTranslation("data");
    const router = useRouter();
    const query = router.query;
    const dataRecordFields = dataFields(t);

    const selectedPage = parseInt(query.selectedPage) || 0;
    const selectedRowsPerPage =
        parseInt(getLocalStorage(constants.LOCAL_STORAGE.DATA.PAGE_SIZE)) ||
        100;
    const selectedOrder = query.selectedOrder || constants.SORT_ASCENDING;
    const selectedOrderBy = query.selectedOrderBy || dataRecordFields.NAME.key;

    const isFile = query.type === ResourceTypes.FILE;
    const resourceId = query.resourceId;
    const createFile = query.createFile;
    const routerPathname = router.pathname;

    const fullPath = router.asPath;
    // Remove the dynamic part of the path if it's there
    // (it won't be there if user navigates directly to /data/ds)
    const baseRoutingPath = routerPathname.replace(dynamicPathName, "");
    const path = fullPath.replace(baseRoutingPath, "").split("?")[0];

    const handlePathChange = useCallback(
        (path, resourceType, id) => {
            const encodedPath = getEncodedPath(path);
            if (!resourceType || resourceType === ResourceTypes.FOLDER) {
                router.push(
                    `${baseRoutingPath}${dynamicPathName}`,
                    `${baseRoutingPath}${encodedPath}`
                );
            } else {
                router.push(
                    `${baseRoutingPath}${dynamicPathName}?type=${ResourceTypes.FILE}&resourceId=${id}`,
                    `${baseRoutingPath}${encodedPath}?type=${ResourceTypes.FILE}&resourceId=${id}`
                );
            }
        },
        [baseRoutingPath, router]
    );

    const onCreateHTFileSelected = useCallback(
        (path) => {
            const createFile = infoTypes.HT_ANALYSIS_PATH_LIST;
            const encodedPath = getEncodedPath(
                path.concat(`/${viewerConstants.NEW_FILE_NAME}`)
            );
            router.push(
                `${baseRoutingPath}${dynamicPathName}?type=${ResourceTypes.FILE}&createFile=${createFile}`,
                `${baseRoutingPath}${encodedPath}?type=${ResourceTypes.FILE}&createFile=${createFile}`
            );
        },
        [baseRoutingPath, router]
    );

    const onCreateMultiInputFileSelected = useCallback(
        (path) => {
            const createFile = infoTypes.MULTI_INPUT_PATH_LIST;
            const encodedPath = getEncodedPath(
                path.concat(`/${viewerConstants.NEW_FILE_NAME}`)
            );
            router.push(
                `${baseRoutingPath}${dynamicPathName}?type=${ResourceTypes.FILE}&createFile=${createFile}`,
                `${baseRoutingPath}${encodedPath}?type=${ResourceTypes.FILE}&createFile=${createFile}`
            );
        },
        [baseRoutingPath, router]
    );

    const onNewFileSaved = useCallback(
        (path, resourceId) => {
            const encodedPath = getEncodedPath(path);
            router.push(
                `${baseRoutingPath}${dynamicPathName}?type=${ResourceTypes.FILE}&resourceId=${resourceId}`,
                `${baseRoutingPath}${encodedPath}?type=${ResourceTypes.FILE}&resourceId=${resourceId}`
            );
        },
        [baseRoutingPath, router]
    );

    const onRouteToListing = useCallback(
        (path, order, orderBy, page, rowsPerPage) => {
            const encodedPath = getEncodedPath(path);
            router.push(
                `${baseRoutingPath}${dynamicPathName}?selectedOrder=${order}&selectedOrderBy=${orderBy}&selectedPage=${page}&selectedRowsPerPage=${rowsPerPage}`,
                `${baseRoutingPath}${encodedPath}?selectedOrder=${order}&selectedOrderBy=${orderBy}&selectedPage=${page}&selectedRowsPerPage=${rowsPerPage}`
            );
        },
        [baseRoutingPath, router]
    );

    if (!isFile) {
        return (
            <Listing
                path={decodeURIComponent(path)}
                handlePathChange={handlePathChange}
                baseId="data"
                onCreateHTFileSelected={onCreateHTFileSelected}
                onCreateMultiInputFileSelected={onCreateMultiInputFileSelected}
                selectedPage={selectedPage}
                selectedRowsPerPage={selectedRowsPerPage}
                selectedOrder={selectedOrder}
                selectedOrderBy={selectedOrderBy}
                onRouteToListing={onRouteToListing}
            />
        );
    } else {
        return (
            <FileViewer
                resourceId={resourceId}
                path={decodeURIComponent(path)}
                createFile={createFile}
                baseId="data.viewer"
                onNewFileSaved={onNewFileSaved}
            />
        );
    }
}

DataStore.getInitialProps = async () => ({
    namespacesRequired: ["data", "util"],
});
