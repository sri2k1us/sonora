/**
 *
 * Code mirror based Editor
 *
 * @author sriram
 *
 */
import React, { useEffect, useState } from "react";
import { Controlled as CodeMirror } from "react17-codemirror2";

import buildID from "components/utils/DebugIDUtil";

import ids from "./ids";
import viewerConstants from "./constants";

import Skeleton from "@material-ui/lab/Skeleton";

export const CODE_MIRROR_MODES = {
    R: "r",
    PYTHON: "python",
    GITHUB_FLAVORED_MARKDOWN: "gfm",
    YAML: "yaml",
    DOCKERFILE: "dockerfile",
    SHELL: "shell",
    PERL: "perl",
};

export default function Editor(props) {
    const {
        baseId,
        mode = "",
        showLineNumbers,
        editable,
        wrapText,
        editorInstance,
        setEditorInstance,
        setEditorValue,
        setDirty,
        editorValue,
    } = props;

    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (mode) {
            require(`codemirror/mode/${mode}/${mode}.js`);
        }
        require("codemirror/lib/codemirror.css");

        setReady(true);
    }, [mode]);

    if (ready) {
        return (
            <CodeMirror
                editorDidMount={(editor) => {
                    setEditorInstance(editor);
                }}
                value={editorValue}
                options={{
                    mode,
                    lineNumbers: showLineNumbers,
                    readOnly: !editable,
                    lineWrapping: wrapText,
                }}
                onBeforeChange={(editor, data, value) => {
                    setEditorValue(value);
                }}
                onChange={(editor, value) => {
                    setDirty(
                        editorInstance ? !editorInstance.isClean() : false
                    );
                }}
            />
        );
    } else {
        return (
            <Skeleton
                id={buildID(baseId, ids.EDITOR_SKELETON)}
                animation="wave"
                width="100%"
                height={viewerConstants.DEFAULT_VIEWER_HEIGHT}
            />
        );
    }
}
