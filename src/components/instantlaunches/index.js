import React from "react";

import micromatch from "micromatch";

import { IconButton } from "@material-ui/core";

import { Launch as LaunchIcon } from "@material-ui/icons";

import withErrorAnnouncer from "components/utils/error/withErrorAnnouncer";
import launchConstants from "components/apps/launch/constants";

import { getAppInfo, getQuickLaunch } from "serviceFacades/quickLaunches";
import { submitAnalysis, getAnalysis } from "serviceFacades/analyses";

import { useTranslation } from "i18n";

const inputParamTypes = [
    launchConstants.PARAM_TYPE.FILE_INPUT,
    launchConstants.PARAM_TYPE.FOLDER_INPUT,
    launchConstants.PARAM_TYPE.MULTIFILE_SELECTOR,
];

/**
 * Returns an Array tuple containing the instant launch object and the name of the
 * first pattern that the resource matched.
 *
 * @param {Object} defaults - The return value of serviceFacads/instantlaunches/getDefaultsMapping.
 * @param {Object} resource - Object representing a potential input. Needs at least label and infoType fields.
 */
export const defaultInstantLaunch = (defaults = {}, resource) => {
    const mappings = Object.entries(defaults);

    var instantLaunch;
    var patternName;

    for (const [matcherName, matcher] of mappings) {
        switch (matcher.kind) {
            case "glob":
                if (micromatch.isMatch(resource.label, matcher.pattern)) {
                    instantLaunch = matcher;
                    patternName = matcherName;
                }
                break;

            case "infoType":
                if (matcher.pattern === resource.infoType) {
                    instantLaunch = matcher;
                    patternName = matcherName;
                }
                break;

            default:
                break;
        }
    }

    return [instantLaunch, patternName];
};

/**
 * Event handler for the button that performs the instant launch.
 *
 * @param {Object} instantLaunch - The instant launch object returned by defaultInstantLaunch().
 * @param {Object} resource - An array of resources to use as inputs to the instantly launched app.
 */
const instantlyLaunch = async (instantLaunch, resource) => {
    let qID; // The quick launch ID, used to get app information.
    let qlp; // The promise used to get quick launch information.

    // The format of the instantLaunch object passed in by the data window is a bit different
    // than the format passed in by the dashboard, so a bit of normalization needs to take
    // place.
    if (instantLaunch.hasOwnProperty("default")) {
        // The data window logic.
        // The quick launch ID is buried in the "default" map of the object passed in
        // from the data window.
        qID = instantLaunch.default["quick_launch_id"];

        // We'll need to get the quick launch info from the API since it contains the
        // submission, which isn't provided from the data window.
        qlp = getQuickLaunch(qID).catch((e) => console.log(e));
    } else {
        // The dashboard logic.
        // The quick launch ID is a top-level property of the object passed in.
        qID = instantLaunch.quick_launch_id;

        // Wrap the instant launch object in a promise so we don't have to branch logic
        // farther down.
        qlp = new Promise((resolve, reject) => {
            resolve(instantLaunch);
        });
    }

    // Contains the Promises that resolve to the data needed to perform a job submission.
    const promiseList = [
        qlp,
        getAppInfo(null, { qId: qID }).catch((e) => console.log(e)),
    ];

    return await Promise.all(promiseList)
        .then((values) => {
            const [ql, app] = values;
            const submission = ql.submission;
            const appParams = app.groups.find((g) => g.label === "Parameters")
                .parameters;
            const appInputs = appParams.filter((param) =>
                inputParamTypes.includes(param.type)
            );

            // Get listing of the input parameters from the app info that
            // aren't set in the QL submission
            const unsetInputParams = appInputs.filter((appParam) => {
                return (
                    !submission.config.hasOwnProperty(appParam.id) ||
                    (Array.isArray(submission.config[appParam.id]) &&
                        submission.config[appParam.id].length === 0)
                );
            });

            // For each unset input parameter, match it up with an appropriate
            // resource that was passed in to the function. File resources should
            // go with FileInput params or MultiFileSelectors, while folder resources
            // should go with FolderInput params.
            if (resource && unsetInputParams.length > 0) {
                for (const unsetParam of unsetInputParams) {
                    if (resource.type === "file") {
                        if (
                            unsetParam.type ===
                            launchConstants.PARAM_TYPE.FILE_INPUT
                        ) {
                            submission.config[unsetParam.id] = resource.path;
                            break;
                        }

                        if (
                            unsetParam.type ===
                            launchConstants.PARAM_TYPE.MULTIFILE_SELECTOR
                        ) {
                            submission.config[unsetParam.id] = [resource.path];
                            break;
                        }
                    }

                    if (resource.type === "folder") {
                        if (
                            unsetParam.type ===
                            launchConstants.PARAM_TYPE.FOLDER_INPUT
                        ) {
                            submission.config[unsetParam.id] = resource.path;
                            break;
                        }
                    }
                }
            }
            return submission;
        })
        .then((submission) => submitAnalysis(submission)) // submit the analysis
        .then((analysisResp) => getAnalysis(analysisResp.id));
};

/**
 * An IconButton with a handler that launches the app in the instant launch with
 * the resource as an input.
 *
 * @param {Object} props
 * @param {Object} props.instantLaunch - The instant launch to use.
 * @param {Object} props.resource - The resource to use as an input to the instant launch.
 */
const InstantLaunchButton = ({
    instantLaunch,
    resource = {},
    showErrorAnnouncer,
}) => {
    const { t } = useTranslation(["instantlaunches", "common"]);
    return (
        <IconButton
            variant="contained"
            onClick={async (event) => {
                event.stopPropagation();
                event.preventDefault();

                await instantlyLaunch(instantLaunch, resource)
                    .then((listing) => {
                        if (listing.analyses.length > 0) {
                            const analysis = listing.analyses[0];
                            if (analysis.interactive_urls.length > 0) {
                                window.open(analysis.interactive_urls[0]);
                            }
                        }
                    })
                    .catch((error) =>
                        showErrorAnnouncer(t("instantLaunchError"), error)
                    );
            }}
        >
            <LaunchIcon />
        </IconButton>
    );
};

export default withErrorAnnouncer(InstantLaunchButton);
