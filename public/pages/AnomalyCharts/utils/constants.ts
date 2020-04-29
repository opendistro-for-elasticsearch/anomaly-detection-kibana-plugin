/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

export const INITIAL_ANOMALY_SUMMARY = {
    anomalyOccurrence: 0,
    minAnomalyGrade: 0.0,
    maxAnomalyGrade: 0.0,
    minConfidence: 0.0,
    maxConfidence: 0.0,
    lastAnomalyOccurrence: '',
};


export enum ANOMALY_CHART_TITLE {
    SAMPLE_ANOMALY_HISTORY = 'Sample anomaly history',
    ANOMALY_HISTORY = 'Sample anomaly history',
}

export enum CHART_FIELDS {
    PLOT_TIME = 'plotTime',
    ANOMALY_GRADE = 'anomalyGrade',
    CONFIDENCE = 'confidence',
    DATA = 'data',
}

export enum CHART_COLORS {
    ANOMALY_GRADE_COLOR = '#D13212',
    FEATURE_DATA_COLOR = '#16191F',
    CONFIDENCE_COLOR = '#017F75',
}

export const FEATURE_CHART_THEME = {
    lineSeriesStyle: {
        line: {
            strokeWidth: 2,
            visible: true,
            opacity: 0.5,
        },
        point: {
            visible: true,
            stroke: CHART_COLORS.FEATURE_DATA_COLOR,
        },
    },
};

export const DATE_PICKER_QUICK_OPTIONS = [
    { start: 'now-24h', end: 'now', label: 'last 24 hours' },
    { start: 'now-7d', end: 'now', label: 'last 7 days' },
    { start: 'now-30d', end: 'now', label: 'last 30 days' },
    { start: 'now-90d', end: 'now', label: 'last 90 days' },

    { start: 'now/d', end: 'now', label: 'Today' },
    { start: 'now/w', end: 'now', label: 'Week to date' },
    { start: 'now/M', end: 'now', label: 'Month to date' },
    { start: 'now/y', end: 'now', label: 'Year to date' },
];

export enum LIVE_CHART_CONFIG {
    REFRESH_INTERVAL_IN_SECONDS = 30 * 1000, //poll anomaly result every 30 seconds
    MONITORING_INTERVALS = 60,
}
