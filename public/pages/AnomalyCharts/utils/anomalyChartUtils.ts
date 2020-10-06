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

import { cloneDeep, get, isEmpty } from 'lodash';
import {
  DateRange,
  Detector,
  MonitorAlert,
  AnomalySummary,
} from '../../../models/interfaces';
import { dateFormatter, minuteDateFormatter } from '../../utils/helpers';
import { RectAnnotationDatum } from '@elastic/charts';
import { DEFAULT_ANOMALY_SUMMARY } from './constants';
import { PlotData } from 'plotly.js';
import moment, { Moment } from 'moment';
import { calculateTimeWindowsWithMaxDataPoints } from '../../utils/anomalyResultUtils';

export const getAlertsQuery = (monitorId: string, startTime: number) => {
  return {
    index: '.opendistro-alerting-alert*',
    size: 1000,
    rawQuery: {
      aggregations: {
        total_alerts: {
          value_count: {
            field: 'monitor_id',
          },
        },
      },
      query: {
        bool: {
          filter: [
            {
              term: {
                monitor_id: monitorId,
              },
            },
            {
              range: {
                start_time: {
                  gte: startTime,
                  format: 'epoch_millis',
                },
              },
            },
          ],
        },
      },
      sort: [{ start_time: { order: 'desc' } }],
    },
  };
};

export const convertAlerts = (response: any): MonitorAlert[] => {
  const hits = get(response, 'data.response.hits.hits', []);
  return hits.map((alert: any) => {
    return {
      monitorName: get(alert, '_source.monitor_name'),
      triggerName: get(alert, '_source.trigger_name'),
      severity: get(alert, '_source.severity'),
      state: get(alert, '_source.state'),
      error: get(alert, '_source.error_message'),
      startTime: get(alert, '_source.start_time'),
      endTime: get(alert, '_source.end_time'),
      acknowledgedTime: get(alert, '_source.acknowledged_time'),
    };
  });
};

const getAlertMessage = (alert: MonitorAlert): string => {
  const message = alert.endTime
    ? `There is a severity ${alert.severity} alert with state ${
        alert.state
      } between ${dateFormatter(alert.startTime)} and ${dateFormatter(
        alert.endTime
      )}.`
    : `There is a severity ${alert.severity} alert with state ${
        alert.state
      } from ${dateFormatter(alert.startTime)}.`;
  return alert.error ? `${message} Error message: ${alert.error}` : message;
};

export const generateAlertAnnotations = (alerts: MonitorAlert[]): any[] => {
  return alerts.map((alert: MonitorAlert) => ({
    header: dateFormatter(alert.startTime),
    dataValue: alert.startTime,
    details: getAlertMessage(alert),
  }));
};

const findLatestAnomaly = (anomalies: any[]) => {
  const latestAnomaly = anomalies.reduce((prevAnomaly, curAnomaly) =>
    prevAnomaly.startTime > curAnomaly.startTime ? prevAnomaly : curAnomaly
  );
  return latestAnomaly;
};

export const getAnomalySummary = (totalAnomalies: any[]): AnomalySummary => {
  if (totalAnomalies == undefined || totalAnomalies.length === 0) {
    return DEFAULT_ANOMALY_SUMMARY;
  }
  const anomalies = totalAnomalies.filter(
    (anomaly) => anomaly.anomalyGrade > 0
  );
  const maxConfidence = Math.max(
    ...anomalies.map((anomaly) => anomaly.confidence),
    0.0
  );
  const minConfidence = Math.min(
    ...anomalies.map((anomaly) => anomaly.confidence),
    1.0
  );

  const maxAnomalyGrade = Math.max(
    ...anomalies.map((anomaly) => anomaly.anomalyGrade),
    0.0
  );
  const minAnomalyGrade = Math.min(
    ...anomalies.map((anomaly) => anomaly.anomalyGrade),
    1.0
  );

  const lastAnomalyOccurrence =
    anomalies.length > 0
      ? minuteDateFormatter(findLatestAnomaly(anomalies).endTime)
      : '-';

  return {
    anomalyOccurrence: anomalies.length,
    minAnomalyGrade: minAnomalyGrade > maxAnomalyGrade ? 0 : minAnomalyGrade,
    maxAnomalyGrade: maxAnomalyGrade,
    minConfidence: minConfidence > maxConfidence ? 0 : minConfidence,
    maxConfidence: maxConfidence,
    lastAnomalyOccurrence: lastAnomalyOccurrence,
  };
};

export const disabledHistoryAnnotations = (
  dateRange: DateRange,
  detector?: Detector
): RectAnnotationDatum[] => {
  if (!detector || !detector.disabledTime) {
    return [];
  }
  const startTime = detector.disabledTime;
  const endTime = detector.enabled
    ? detector.enabledTime
    : dateRange.endDate.valueOf();

  const details =
    detector.enabled && detector.enabledTime
      ? `Detector was stopped from ${dateFormatter(
          startTime
        )} to ${dateFormatter(detector.enabledTime)}`
      : `Detector was stopped from ${dateFormatter(startTime)} until now`;
  const coordinateX0 =
    startTime >= dateRange.startDate.valueOf()
      ? startTime
      : dateRange.startDate.valueOf();
  return [
    {
      coordinates: {
        x0: coordinateX0,
        x1: endTime,
      },
      details: details,
    },
  ];
};

export const ANOMALY_HEATMAP_COLORSCALE = [
  [0, '#F2F2F2'],
  [0.2, '#F2F2F2'],
  [0.2, '#F7E0B8'],
  [0.4, '#F7E0B8'],
  [0.4, '#F2C596'],
  [0.6, '#F2C596'],
  [0.6, '#ECA976'],
  [0.8, '#ECA976'],
  [0.8, '#E78D5B'],
  [1, '#E8664C'],
];

const getColorForValue = (value: number) => {
  if (
    value >=
    ANOMALY_HEATMAP_COLORSCALE[ANOMALY_HEATMAP_COLORSCALE.length - 1][0]
  ) {
    return ANOMALY_HEATMAP_COLORSCALE[ANOMALY_HEATMAP_COLORSCALE.length - 1][1];
  }

  if (value <= ANOMALY_HEATMAP_COLORSCALE[0][0]) {
    return ANOMALY_HEATMAP_COLORSCALE[0][1];
  }

  for (let i = 0; i < ANOMALY_HEATMAP_COLORSCALE.length - 1; i++) {
    if (
      value >= ANOMALY_HEATMAP_COLORSCALE[i][0] &&
      value < ANOMALY_HEATMAP_COLORSCALE[i + 1][0]
    ) {
      return ANOMALY_HEATMAP_COLORSCALE[i + 1][1];
    }
  }
};

const NUM_CELLS = 20;

interface AggregatedAnomalyResult {
  maxAnomalyGrade: number | null;
  numAnomalyGrade: number | null;
  dateRange: DateRange;
}

export const HEATMAP_X_AXIS_DATE_FORMAT = 'MM-DD HH:mm YYYY';

export const getAnomaliesHeatmapData = (
  anomalies: any[],
  dateRange: DateRange
): PlotData[] => {
  console.log('anomalies', anomalies);

  const timeWindows = calculateTimeWindowsWithMaxDataPoints(
    NUM_CELLS,
    dateRange
  );

  const aggregatedResultsInWindows = [] as AggregatedAnomalyResult[];
  timeWindows.forEach((timeWindow) => {
    const anomaliesInWindow = anomalies.filter(
      (anomaly) =>
        get(anomaly, 'plotTime', 0) <= timeWindow.endDate &&
        get(anomaly, 'plotTime', 0) >= timeWindow.startDate
    );
    // .filter((anomaly) => get(anomaly, 'anomalyGrade', 0) > 0);
    const anomalyGrades = anomaliesInWindow.map((anomaly) =>
      get(anomaly, 'anomalyGrade', 0)
    );
    if (!isEmpty(anomalyGrades)) {
      aggregatedResultsInWindows.push({
        maxAnomalyGrade: Math.max(...anomalyGrades),
        numAnomalyGrade: anomalyGrades.filter(
          (anomalyGrade) => anomalyGrade > 0
        ).length,
        dateRange: timeWindow,
      });
    } else {
      aggregatedResultsInWindows.push({
        maxAnomalyGrade: 0,
        numAnomalyGrade: 0,
        dateRange: timeWindow,
      });
    }
  });

  const plotTimes = aggregatedResultsInWindows.map((aggregatedResults) =>
    get(aggregatedResults, 'dateRange.endDate', 0)
  );
  const maxAnomalyGrades = aggregatedResultsInWindows.map((aggregatedResults) =>
    get(aggregatedResults, 'maxAnomalyGrade', 0)
  );

  const numAnomalyGrades = aggregatedResultsInWindows.map((aggregatedResults) =>
    get(aggregatedResults, 'numAnomalyGrade', 0)
  );
  // console.log('plotTimes', plotTimes);
  // console.log('aggregatedResultsInWindows', aggregatedResultsInWindows);
  // console.log('maxAnomalyGrades', maxAnomalyGrades);
  // console.log('anomalyGrades', anomalyGrades);
  const entities = ['value1', 'value2', 'value3', 'value4', 'value5'];
  const z = [];
  for (let i = 0; i < entities.length; i++) {
    const row = [];
    for (let j = 0; j < plotTimes.length; j++) {
      row.push(maxAnomalyGrades[j]);
    }
    z.push(row);
  }
  const texts = [];
  for (let i = 0; i < entities.length; i++) {
    const row = [];
    for (let j = 0; j < plotTimes.length; j++) {
      row.push(`${numAnomalyGrades[j]}`);
    }
    texts.push(row);
  }
  // console.log('z data', z);
  // const z_focused = [];
  // for (let i = 0; i < entities.length; i++) {
  //   const row = [];
  //   for (let j = 0; j < plotTimes.length; j++) {
  //     if (i == 0 && j == 0) {
  //       row.push(z[i][j]);
  //     } else {
  //       row.push(null);
  //     }
  //   }
  //   z_focused.push(row);
  // }
  // console.log('z_focused data', z_focused);
  // const xs = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'];
  // const zs = [];
  // for (let i = 0; i < entities.length; i++) {
  //   const row = [];
  //   for (let j = 0; j < xs.length; j++) {
  //     row.push(Math.random());
  //   }
  //   zs.push(row);
  // }
  const plotData = [
    {
      x: plotTimes.map((timestamp) =>
        moment(timestamp).format(HEATMAP_X_AXIS_DATE_FORMAT)
      ),
      y: entities,
      z: z,
      colorscale: ANOMALY_HEATMAP_COLORSCALE,
      //@ts-ignore
      zmin: 0,
      zmax: 1,
      type: 'heatmap',
      showscale: false,
      xgap: 2,
      ygap: 2,
      opacity: 1,
      text: texts,
      // text: [
      //   plotDateRanges.map((result) => {
      //     moment(get(result, 'startDate')).format(HEATMAP_X_AXIS_DATE_FORMAT) +
      //       '-' +
      //       moment(get(result, 'endDate')).format(HEATMAP_X_AXIS_DATE_FORMAT);
      //   }),
      //   plotDateRanges.map((result) => {
      //     moment(get(result, 'startDate')).format(HEATMAP_X_AXIS_DATE_FORMAT) +
      //       '-' +
      //       moment(get(result, 'endDate')).format(HEATMAP_X_AXIS_DATE_FORMAT);
      //   }),
      //   plotDateRanges.map((result) => {
      //     moment(get(result, 'startDate')).format(HEATMAP_X_AXIS_DATE_FORMAT) +
      //       '-' +
      //       moment(get(result, 'endDate')).format(HEATMAP_X_AXIS_DATE_FORMAT);
      //   }),
      //   plotDateRanges.map((result) => {
      //     moment(get(result, 'startDate')).format(HEATMAP_X_AXIS_DATE_FORMAT) +
      //       '-' +
      //       moment(get(result, 'endDate')).format(HEATMAP_X_AXIS_DATE_FORMAT);
      //   }),
      //   plotDateRanges.map((result) => {
      //     moment(get(result, 'startDate')).format(HEATMAP_X_AXIS_DATE_FORMAT) +
      //       '-' +
      //       moment(get(result, 'endDate')).format(HEATMAP_X_AXIS_DATE_FORMAT);
      //   }),
      // ],
      // hoverinfo: 'x+y+z',
      hovertemplate:
        '<b>Time</b>: %{x}<br>' +
        '<b>Max anomaly grade</b>: %{z}<br>' +
        '<b>Anomaly Occurrences</b>: %{text}' +
        '<extra></extra>',
    },
  ] as PlotData[];
  return plotData;
};

export const updateHeatmapPlotData = (heatmapData: PlotData, update: any) => {
  return {
    ...cloneDeep(heatmapData),
    ...update,
  } as PlotData;
};

export const getSelectedHeatmapCellPlotData = (
  heatmapData: PlotData,
  selectedX: number,
  selectedY: number
) => {
  const originalZ = cloneDeep(heatmapData.z);
  const selectedZData = [];
  //@ts-ignore
  const selectedValue = originalZ[selectedY][selectedX];
  for (let i = 0; i < originalZ.length; i++) {
    const row = [];
    //@ts-ignore
    for (let j = 0; j < originalZ[0].length; j++) {
      if (i === selectedY && j === selectedX) {
        row.push(selectedValue);
      } else {
        row.push(null);
      }
    }
    selectedZData.push(row);
  }
  const colorForCell = getColorForValue(selectedValue);
  //@ts-ignore
  return [
    {
      ...cloneDeep(heatmapData),
      z: selectedZData,
      colorscale: [
        [0, colorForCell],
        [1, colorForCell],
      ],
      opacity: 1,
      hoverinfo: 'skip',
      hovertemplate: null,
    },
  ] as PlotData[];
};
