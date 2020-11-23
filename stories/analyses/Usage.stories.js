import React from "react";
import Usage from "../../src/components/analyses/toolbar/Usage";

export const UsageTest = () => {
    const counts = [
        {
            count: 52,
            status: "Running",
        },
        {
            count: 99,
            status: "Submitted",
        },
        {
            count: 11,
            status: "Canceled",
        },
        {
            count: 262,
            status: "Completed",
        },
        {
            count: 63,
            status: "Failed",
        },
    ];

    return <Usage counts={counts} />;
};

export default {
    title: "Analyses / Usage",
};
