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

import { cloneDeep, get, isEmpty, orderBy } from 'lodash';
import {
  DateRange,
  Detector,
  MonitorAlert,
  AnomalySummary,
  EntityData,
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

export enum AnomalyHeatmapSortType {
  SEVERITY = 'by_severity',
  OCCURRENCES = 'by_occurrences',
}

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
  maxAnomalyGrade: number;
  numAnomalyGrade: number;
  dateRange: DateRange;
  entity: EntityData[];
}

export const HEATMAP_X_AXIS_DATE_FORMAT = 'MM-DD HH:mm YYYY';

export const getAnomaliesHeatmapData = (
  anomalies: any[],
  dateRange: DateRange,
  displayTopNum?: number = 10
): PlotData[] => {
  const entityAnomaliesMap = getEntityAnomaliesMap(anomalies);

  const entityValues = [] as string[];
  const maxAnomalyGrades = [] as any[];
  const numAnomalyGrades = [] as any[];

  const timeWindows = calculateTimeWindowsWithMaxDataPoints(
    NUM_CELLS,
    dateRange
  );

  entityAnomaliesMap.forEach((entityAnomalies, entity) => {
    const maxAnomalyGradesForEntity = [] as number[];
    const numAnomalyGradesForEntity = [] as number[];
    entityValues.push(entity);
    timeWindows.forEach((timeWindow) => {
      const anomaliesInWindow = entityAnomalies.filter(
        (anomaly) =>
          get(anomaly, 'plotTime', 0) <= timeWindow.endDate &&
          get(anomaly, 'plotTime', 0) >= timeWindow.startDate
      );
      const entityAnomalyGrades = anomaliesInWindow.map((anomaly) =>
        get(anomaly, 'anomalyGrade', 0)
      );
      if (!isEmpty(entityAnomalyGrades)) {
        maxAnomalyGradesForEntity.push(Math.max(...entityAnomalyGrades));
        numAnomalyGradesForEntity.push(
          entityAnomalyGrades.filter((anomalyGrade) => anomalyGrade > 0).length
        );
      } else {
        maxAnomalyGradesForEntity.push(0);
        numAnomalyGradesForEntity.push(0);
      }
    });

    maxAnomalyGrades.push(maxAnomalyGradesForEntity);
    numAnomalyGrades.push(numAnomalyGradesForEntity);
  });

  const plotTimes = timeWindows.map((timeWindow) => timeWindow.endDate);
  const plotData =
    //@ts-ignore
    {
      x: plotTimes.map((timestamp) =>
        moment(timestamp).format(HEATMAP_X_AXIS_DATE_FORMAT)
      ),
      y: entityValues,
      z: maxAnomalyGrades,
      colorscale: ANOMALY_HEATMAP_COLORSCALE,
      //@ts-ignore
      zmin: 0,
      zmax: 1,
      type: 'heatmap',
      showscale: false,
      xgap: 2,
      ygap: 2,
      opacity: 1,
      text: numAnomalyGrades,
      hovertemplate:
        '<b>Time</b>: %{x}<br>' +
        '<b>Max anomaly grade</b>: %{z}<br>' +
        '<b>Anomaly Occurrences</b>: %{text}' +
        '<extra></extra>',
    } as PlotData;
  const resultPlotData = sortHeatmapPlotData(
    plotData,
    AnomalyHeatmapSortType.SEVERITY,
    displayTopNum
  );
  return [resultPlotData];
};

const getEntityAnomaliesMap = (anomalies: any[]): Map<string, any[]> => {
  const entityAnomaliesMap = new Map<string, any[]>();
  anomalies.forEach((anomaly) => {
    const entity = get(anomaly, 'entity', [] as EntityData[]);
    const entityValue = entity[0].value;
    let singleEntityAnomalies = [];
    if (entityAnomaliesMap.has(entityValue)) {
      //@ts-ignore
      singleEntityAnomalies = entityAnomaliesMap.get(entityValue);
    }
    singleEntityAnomalies.push(anomaly);
    entityAnomaliesMap.set(entityValue, singleEntityAnomalies);
  });
  return entityAnomaliesMap;
};

export const sortHeatmapPlotData = (
  heatmapData: PlotData,
  sortType: AnomalyHeatmapSortType,
  topNum: number
) => {
  const originalYs = cloneDeep(heatmapData.y);
  const originalZs = cloneDeep(heatmapData.z);
  const originalTexts = cloneDeep(heatmapData.text);
  const originalValuesToSort =
    sortType === AnomalyHeatmapSortType.SEVERITY
      ? cloneDeep(originalZs)
      : cloneDeep(originalTexts);
  const funcToAggregate =
    sortType === AnomalyHeatmapSortType.SEVERITY
      ? (a: number, b: number) => {
          return Math.max(a, b);
        }
      : (a: number, b: number) => {
          return a + b;
        };
  const yIndicesToSort = [] as object[];
  for (let i = 0; i < originalYs.length; i++) {
    yIndicesToSort.push({
      index: i,
      //@ts-ignore
      value: originalValuesToSort[i].reduce(funcToAggregate),
    });
  }
  console.log('yIndicesToSort', yIndicesToSort);
  const sortedYIndices = orderBy(yIndicesToSort, ['value'], 'desc').slice(
    0,
    topNum
  );
  console.log('sortedYIndices', sortedYIndices);
  const resultYs = [] as any[];
  const resultZs = [] as any[];
  const resultTexts = [] as any[];
  for (let i = sortedYIndices.length - 1; i >= 0; i--) {
    const index = get(sortedYIndices[i], 'index', 0);
    resultYs.push(originalYs[index]);
    resultZs.push(originalZs[index]);
    resultTexts.push(originalTexts[index]);
  }
  return {
    ...cloneDeep(heatmapData),
    y: resultYs,
    z: resultZs,
    text: resultTexts,
  } as PlotData;
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
