/**
 * View images
 *
 *
 * @author sriram
 *
 */
import React, { useEffect, useState } from "react";

import ImageEditor from "@toast-ui/react-image-editor";

import PageWrapper from "components/layout/PageWrapper";
import { useTranslation } from "i18n";

import { getHost } from "../../utils/getHost";
import ids from "./ids";
import Toolbar from "./Toolbar";

import { build } from "@cyverse-de/ui-lib";
import { Typography } from "@material-ui/core";

export default function ImageViewer(props) {
    const { baseId, path, resourceId, onRefresh, fileName } = props;
    const { t } = useTranslation("data");
    const [url, setUrl] = useState("");

    useEffect(() => {
        setUrl(`${getHost()}/api/download?path=${path}`);
    }, [path]);

    if (url) {
        return (
            <PageWrapper appBarHeight={120}>
                <Toolbar
                    baseId={build(baseId, ids.VIEWER_IMAGE, ids.TOOLBAR)}
                    path={path}
                    resourceId={resourceId}
                    allowLineNumbers={false}
                    onRefresh={onRefresh}
                    fileName={fileName}
                />
                {/*  <img
                    id={build(baseId, ids.VIEWER_IMAGE, fileName)}
                    src={`${url}`}
                    alt={fileName}
                    style={{ overflow: "auto" }}
                /> */}
                <ImageEditor
                    includeUI={{
                        loadImage: {
                            path: `${url}`,
                            name: `${fileName}`,
                        },
                        initMenu: "filter",
                        uiSize: {
                            width: "1000px",
                            height: "700px",
                        },
                        menuBarPosition: "bottom",
                    }}
                    cssMaxHeight={500}
                    cssMaxWidth={700}
                    selectionStyle={{
                        cornerSize: 20,
                        rotatingPointOffset: 70,
                    }}
                    usageStatistics={true}
                />
            </PageWrapper>
        );
    } else {
        return <Typography>{t("loading")}</Typography>;
    }
}
