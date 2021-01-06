/**
 * @author aramsey, sriram
 */

import React, { useState } from "react";
import { useTranslation } from "i18n";
import { Field, Form, Formik } from "formik";
import { useQuery, useMutation } from "react-query";

import ids from "../../ids";
import constants from "../../../../constants";

import {
    getAppDetailsForAdmin,
    deleteApp,
    updateApp,
    adminAddAppDoc,
    adminUpdateAppDoc,
    ADMIN_APP_DETAILS_QUERY_KEY,
} from "serviceFacades/apps";

import {
    build,
    FormCheckbox,
    FormMultilineTextField,
    FormTextField,
} from "@cyverse-de/ui-lib";


import DEDialog from "components/utils/DEDialog";
import { getHost } from "components/utils/getHost";
import { Skeleton } from "@material-ui/lab";
import ErrorTypographyWithDialog from "components/utils/error/ErrorTypographyWithDialog";

import { Button, CircularProgress, Grid, Link, Paper } from "@material-ui/core";


export default function AdminAppDetailsDialog(props) {
    const {
        open,
        app,
        parentId,
        restrictedChars,
        restrictedStartingChars,
        documentationTemplateUrl,
        handleClose,
    } = props;

    const { t } = useTranslation("apps");

    const [detailsError, setDetailsError] = useState(null);
    const [updateAppError, setUpdateAppError] = useState(null);
    const [addDocError, setAddDocError] = useState(null);
    const [updateDocError, setUpdateDocError] = useState(null);

    const [details, setDetails] = useState(null);

    const { isFetching: detailsFetching } = useQuery({
        queryKey: [
            ADMIN_APP_DETAILS_QUERY_KEY,
            {
                systemId: app?.system_id,
                appId: app?.id,
            },
        ],
        queryFn: getAppDetailsForAdmin,
        config: {
            enabled: !!app,
            onSuccess: setDetails,
            onError: setDetailsError,
        },
    });

    const [doAppUpdate, { status: updateAppStatus }] = useMutation(updateApp, {
        onSuccess: (data) => {
            handleClose();
        },
        onError: setUpdateAppError,
    });

    const [addDoc, { status: addDocStatus }] = useMutation(adminAddAppDoc, {
        onSuccess: (data) => {
            handleClose();
        },
        onError: setAddDocError,
    });

    const [updateDoc, { status: updateDocStatus }] = useMutation(
        adminUpdateAppDoc,
        {
            onSuccess: (data) => {
                handleClose();
            },
            onError: setUpdateDocError,
        }
    );

    const handleSubmit = (values) => {
        const documentation = details?.documentation;
        if (app !== values) {
            const {
                deleted,
                disabled,
                description,
                name,
                id,
                system_id,
                extra,
            } = values;
            doAppUpdate({
                deleted,
                disabled,
                extra,
                description,
                name,
                id,
                system_id,
            });
        }

        if (
            (!documentation || !documentation.documentation) &&
            values.documentation &&
            values.documentation.documentation
        ) {
            addDoc({
                systemId: values.system_id,
                appId: values.id,
                doc: values.documentation.documentation,
            });
        } else if (
            values.documentation &&
            documentation.documentation !== values.documentation.documentation
        ) {
            updateDoc({
                systemId: values.system_id,
                appId: values.id,
                doc: values.documentation.documentation,
            });
        }
    };

    return (
        <DEDialog
            open={open}
            fullWidth={true}
            maxWidth="sm"
            onClose={handleClose}
            baseId={parentId}
            title={app.name}
        >
            {detailsFetching && (
                <Skeleton animation="wave" variant="rect" height={800} />
            )}
            {detailsError && (
                <ErrorTypographyWithDialog
                    errorMessage={t("appDetailsError")}
                    errorObject={detailsError}
                />
            )}
            {(updateAppStatus === constants.LOADING || addDocStatus === constants.LOADING || updateDocStatus === constants.LOADING) && (
                <CircularProgress
                    size={30}
                    thickness={5}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                    }}
                />
            )}
            {updateAppError && (
                <ErrorTypographyWithDialog
                    errorMessage={t("updateAppError")}
                    errorObject={updateAppError}
                />
            )}
            {addDocError && (
                <ErrorTypographyWithDialog
                    errorMessage={t("addDocError")}
                    errorObject={addDocError}
                />
            )}
            {updateDocError && (
                <ErrorTypographyWithDialog
                    errorMessage={t("updateDocError")}
                    errorObject={updateDocError}
                />
            )}
            {details && (
                <Formik
                    initialValues={mapPropsToValues(app, details)}
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                >
                    {({ values }) => {
                        return (
                            <AdminAppDetailsForm
                                parentId={parentId}
                                restrictedChars={restrictedChars}
                                restrictedStartingChars={
                                    restrictedStartingChars
                                }
                                documentationTemplateUrl={
                                    documentationTemplateUrl
                                }
                                handleClose={handleClose}
                            />
                        );
                    }}
                </Formik>
            )}
        </DEDialog>
    );
}

function mapPropsToValues(app, details) {
    return { ...app, ...details };
}

function AdminAppDetailsForm(props) {
    const {
        parentId,
        restrictedChars,
        restrictedStartingChars,
        documentationTemplateUrl,
        handleClose,
    } = props;

    const { t } = useTranslation("apps");
    const { t: i18nCommon } = useTranslation("common");
    return (
        <Form>
            <Field
                name={"name"}
                label={t("name")}
                id={build(parentId, ids.ADMIN_DETAILS.NAME)}
                validate={(value) =>
                    validateAppName(
                        restrictedStartingChars,
                        restrictedChars,
                        value
                    )
                }
                component={FormTextField}
            />
            <Field
                name={"description"}
                label={t("descriptionLabel")}
                id={build(parentId, ids.ADMIN_DETAILS.DESCRIPTION)}
                component={FormMultilineTextField}
            />
            <Field
                name={"integrator_name"}
                label={t("integratorName")}
                id={build(parentId, ids.ADMIN_DETAILS.INTEGRATOR)}
                component={FormTextField}
            />
            <Field
                name={"integrator_email"}
                label={t("integratorEmail")}
                id={build(parentId, ids.ADMIN_DETAILS.INTEGRATOR_EMAIL)}
                component={FormTextField}
            />
            <Field
                name={"extra.htcondor.extra_requirements"}
                label={t("htcondorExtraRequirements")}
                id={build(parentId, ids.ADMIN_DETAILS.HTCONDOR_EXTRA_REQS)}
                component={FormTextField}
            />
            <Field
                name={"deleted"}
                label={t("deleted")}
                id={build(parentId, ids.ADMIN_DETAILS.DELETED)}
                component={FormCheckbox}
            />
            <Field
                name={"disabled"}
                label={t("disabled")}
                id={build(parentId, ids.ADMIN_DETAILS.DISABLED)}
                component={FormCheckbox}
            />
            <Field
                name={"beta"}
                label={t("beta")}
                id={build(parentId, ids.ADMIN_DETAILS.BETA)}
                component={FormCheckbox}
            />
            <Paper elevation={1}>
                {t("documentationInstructions")}
                <Link
                    onClick={() =>
                        window.open(getHost() + "/" + documentationTemplateUrl)
                    }
                >
                    {t("documentationTemplate")}
                </Link>
            </Paper>
            <Field
                name={"documentation.documentation"}
                label={t("appDocumentation")}
                id={build(parentId, ids.ADMIN_DETAILS.DOCUMENTATION)}
                t
                multiline
                rows={10}
                component={FormTextField}
            />
            <Grid
                container
                direction="row"
                justify="flex-end"
                alignItems="flex-end"
                spacing={1}
            >
                <Grid item>
                    <Button
                        id={build(parentId, ids.CANCEL_BTN)}
                        onClick={handleClose}
                    >
                        {i18nCommon("cancel")}
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        id={build(parentId, ids.SAVE_BTN)}
                        type="submit"
                        color="primary"
                    >
                        {i18nCommon("save")}
                    </Button>
                </Grid>
            </Grid>
        </Form>
    );
}

function validateAppName(restrictedStartingChars, restrictedChars, value) {
    if (!value) {
        return "Empty value";
    }

    let startingCharsRegex = new RegExp("^[" + restrictedStartingChars + "]");
    let invalid = value.match(startingCharsRegex);
    if (invalid) {
        return (
            "App name cannot begin with `" +
            restrictedStartingChars +
            "`. Invalid char: `" +
            invalid +
            "`"
        );
    }

    // Escape each non-alphanumeric char since some are used as special chars in regex
    let escapedRestrictedChars = restrictedChars.replace(/\W/g, "\\$&");
    let restrictedCharsRegex = new RegExp(
        "[" + escapedRestrictedChars + "]",
        "g"
    );
    invalid = value.match(restrictedCharsRegex);
    if (invalid) {
        return (
            "App name cannot contain `" +
            restrictedChars +
            "`. Invalid chars: `" +
            invalid.join("") +
            "`"
        );
    }
}
