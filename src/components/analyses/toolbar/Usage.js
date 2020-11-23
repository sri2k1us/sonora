/**
 * @author sriram
 *
 * A component that shows the analyses by status count
 *
 */

import React from "react";
import {
    Divider,
    Grid,
    IconButton,
    Typography,
    useTheme,
} from "@material-ui/core";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import RefreshIcon from "@material-ui/icons/Refresh";
import AssessmentIcon from "@material-ui/icons/Assessment";
export default function Usage(props) {
    const { counts } = props;
    const theme = useTheme();
    return (
        <>
            <div style={{ marginLeft: 16 }}>
                <span>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                        spacing={1}
                    >
                        <AssessmentIcon color="primary" fontSize="small" />
                        {counts?.map((statusCount) => {
                            return (
                                <Grid item>
                                    <Typography
                                        variant="caption"
                                        style={{
                                            color: theme.palette.primary.main,
                                        }}
                                    >
                                        {statusCount.status}
                                    </Typography>{" "}
                                    <Typography
                                        style={{
                                            color: theme.palette.info.main,
                                        }}
                                    >
                                        {statusCount.count}
                                    </Typography>
                                </Grid>
                            );
                        })}
                        <IconButton size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Grid>
                </span>
            </div>
            <Divider light />
        </>
    );
}
