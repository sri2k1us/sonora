/**
 * @author sriram, aramsey
 *
 */

import React from "react";
import { useRouter } from "next/router";
import Listing from "components/data/listing/Listing";
import { getEncodedPath } from "components/data/utils";
import ResourceTypes from "components/models/ResourceTypes";
import infoTypes from "components/models/InfoTypes";
import FileViewer from "components/data/viewers/FileViewer";

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
    const router = useRouter();
    const query = router.query;
    const isFile = query.file;
    const resourceId = query.resourceId;
    const createFile = query.createFile;

    const routerPathname = router.pathname;

    const fullPath = router.asPath;
    // Remove the dynamic part of the path if it's there
    // (it won't be there if user navigates directly to /data/ds)
    const baseRoutingPath = routerPathname.replace(dynamicPathName, "");
    const path = fullPath.replace(baseRoutingPath, "").split("?")[0];
    const handlePathChange = (path, resourceType, id) => {
        const encodedPath = getEncodedPath(path);
        if (!resourceType || resourceType === ResourceTypes.FOLDER) {
            router.push(
                `${baseRoutingPath}${dynamicPathName}`,
                `${baseRoutingPath}${encodedPath}`
            );
        } else {
            router.push(
                `${baseRoutingPath}${dynamicPathName}?file=true&resourceId=${id}`,
                `${baseRoutingPath}${encodedPath}?file=true&resourceId=${id}`
            );
        }
    };

    const onCreateHTFileSelected = (path) => {
        const createFile = infoTypes.HT_ANALYSIS_PATH_LIST;
        const encodedPath = getEncodedPath(path.concat("/untitled"));
        router.push(
            `${baseRoutingPath}${dynamicPathName}?file=true&createFile=${createFile}`,
            `${baseRoutingPath}${encodedPath}?file=true&createFile=${createFile}`
        );
    };

    const onCreateMultiInputFileSelected = (path) => {
        const createFile = infoTypes.MULTI_INPUT_PATH_LIST;
        const encodedPath = getEncodedPath(path.concat("/untitled"));
        router.push(
            `${baseRoutingPath}${dynamicPathName}?file=true&createFile=${createFile}`,
            `${baseRoutingPath}${encodedPath}?file=true&createFile=${createFile}`
        );
    };

    const onNewFileSaved = (path, resourceId) => {
        const encodedPath = getEncodedPath(path);
        router.push(
            `${baseRoutingPath}${dynamicPathName}?file=true&resourceId=${resourceId}`,
            `${baseRoutingPath}${encodedPath}?file=true&resourceId=${resourceId}`
        );
    };

    const onRefresh = () => {
        router.reload();
    };

    if (!isFile) {
        return (
            <Listing
                path={decodeURIComponent(path)}
                handlePathChange={handlePathChange}
                baseId="data"
                onCreateHTFileSelected={onCreateHTFileSelected}
                onCreateMultiInputFileSelected={onCreateMultiInputFileSelected}
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
                onRefresh={onRefresh}
            />
        );
    }
}

DataStore.getInitialProps = async () => ({
    namespacesRequired: ["data"],
});
