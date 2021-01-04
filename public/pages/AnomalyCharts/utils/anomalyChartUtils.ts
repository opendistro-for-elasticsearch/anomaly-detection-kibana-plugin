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

import { cloneDeep, defaultTo, get, isEmpty, orderBy } from 'lodash';
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
import { Datum, PlotData } from 'plotly.js';
import moment from 'moment';
import { calculateTimeWindowsWithMaxDataPoints } from '../../utils/anomalyResultUtils';
import { HeatmapCell } from '../containers/AnomalyHeatmapChart';
import {
  EntityAnomalySummaries,
  EntityAnomalySummary,
} from '../../../../server/models/interfaces';
import { toFixedNumberForAnomaly } from '../../../../server/utils/helpers';
import { ENTITY_VALUE_PATH_FIELD } from '../../../../server/utils/constants';

export const convertAlerts = (response: any): MonitorAlert[] => {
  const alerts = get(response, 'data.response.alerts', []);
  return alerts.map((alert: any) => {
    return {
      monitorName: get(alert, 'monitor_name'),
      triggerName: get(alert, 'trigger_name'),
      severity: get(alert, 'severity'),
      state: get(alert, 'state'),
      error: get(alert, 'error_message'),
      startTime: get(alert, 'start_time'),
      endTime: get(alert, 'end_time'),
      acknowledgedTime: get(alert, 'acknowledged_time'),
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
  if (
    !detector ||
    !detector.disabledTime ||
    detector.disabledTime > dateRange.endDate.valueOf() ||
    !detector.enabledTime ||
    detector.enabledTime < dateRange.startDate.valueOf()
  ) {
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
  [0.0000001, '#F2F2F2'],
  [0.0000001, '#F7E0B8'],
  [0.2, '#F7E0B8'],
  [0.2, '#F2C596'],
  [0.4, '#F2C596'],
  [0.4, '#ECA976'],
  [0.6, '#ECA976'],
  [0.6, '#E78D5B'],
  [0.8, '#E78D5B'],
  [0.8, '#E8664C'],
  [1, '#E8664C'],
];

export enum AnomalyHeatmapSortType {
  SEVERITY = 'by_severity',
  OCCURRENCES = 'by_occurrences',
}

const getHeatmapColorByValue = (value: number) => {
  // check if value is larger than largest value in color scale
  if (
    value >=
    ANOMALY_HEATMAP_COLORSCALE[ANOMALY_HEATMAP_COLORSCALE.length - 1][0]
  ) {
    return ANOMALY_HEATMAP_COLORSCALE[ANOMALY_HEATMAP_COLORSCALE.length - 1][1];
  }
  // check if value is smaller than smallest value in color scale
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

export const NUM_CELLS = 20;

export const HEATMAP_X_AXIS_DATE_FORMAT = 'MM-DD HH:mm YYYY';

const buildBlankStringWithLength = (length: number) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ' ';
  }
  return result;
};

export const getAnomaliesHeatmapData = (
  anomalies: any[] | undefined,
  dateRange: DateRange,
  sortType: AnomalyHeatmapSortType = AnomalyHeatmapSortType.SEVERITY,
  displayTopNum: number
): PlotData[] => {
  const entityAnomalyResultMap = getEntityAnomaliesMap(anomalies);
  const entityAnomaliesMap = filterEntityAnomalyResultMap(
    entityAnomalyResultMap
  );
  if (isEmpty(entityAnomaliesMap)) {
    // put placeholder data so that heatmap won't look empty
    for (let i = 0; i < displayTopNum; i++) {
      // using blank string with different length as entity values instead of
      // only 1 whitesapce for all entities, to avoid heatmap with single row
      const blankStrValue = buildBlankStringWithLength(i);
      entityAnomaliesMap.set(blankStrValue, []);
    }
  }

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

  const plotTimes = timeWindows.map((timeWindow) => timeWindow.startDate);
  const plotTimesInString = plotTimes.map((timestamp) =>
    moment(timestamp).format(HEATMAP_X_AXIS_DATE_FORMAT)
  );
  const cellTimeInterval = timeWindows[0].endDate - timeWindows[0].startDate;
  const plotData = buildHeatmapPlotData(
    plotTimesInString,
    entityValues,
    maxAnomalyGrades,
    numAnomalyGrades,
    cellTimeInterval
  );
  const resultPlotData = sortHeatmapPlotData(plotData, sortType, displayTopNum);
  return [resultPlotData];
};

const buildHeatmapPlotData = (
  x: any[],
  y: any[],
  z: any[],
  text: any[],
  cellTimeInterval: number
): PlotData => {
  //@ts-ignore
  return {
    x: x,
    y: y,
    z: z,
    colorscale: ANOMALY_HEATMAP_COLORSCALE,
    zmin: 0,
    zmax: 1,
    type: 'heatmap',
    showscale: false,
    xgap: 2,
    ygap: 2,
    opacity: 1,
    text: text,
    hovertemplate:
      '<b>Time</b>: %{x}<br>' +
      '<b>Max anomaly grade</b>: %{z}<br>' +
      '<b>Anomaly occurrences</b>: %{text}' +
      '<extra></extra>',
    cellTimeInterval: cellTimeInterval,
  } as PlotData;
};

export const getEntitytAnomaliesHeatmapData = (
  dateRange: DateRange,
  entitiesAnomalySummaryResult: EntityAnomalySummaries[],
  displayTopNum: number
) => {
  const entityValues = [] as string[];
  const maxAnomalyGrades = [] as any[];
  const numAnomalyGrades = [] as any[];

  const timeWindows = calculateTimeWindowsWithMaxDataPoints(
    NUM_CELLS,
    dateRange
  );

  let entitiesAnomalySummaries = [] as EntityAnomalySummaries[];

  if (isEmpty(entitiesAnomalySummaryResult)) {
    // put placeholder data so that heatmap won't look empty
    for (let i = 0; i < displayTopNum; i++) {
      // using blank string with different length as entity values instead of
      // only 1 whitesapce for all entities, to avoid heatmap with single row
      const blankStrValue = buildBlankStringWithLength(i);
      entitiesAnomalySummaries.push({
        entity: {
          value: blankStrValue,
        },
      } as EntityAnomalySummaries);
    }
  } else {
    entitiesAnomalySummaries = entitiesAnomalySummaryResult;
  }

  entitiesAnomalySummaries.forEach((entityAnomalySummaries) => {
    const maxAnomalyGradesForEntity = [] as number[];
    const numAnomalyGradesForEntity = [] as number[];

    const entityValue = get(
      entityAnomalySummaries,
      ENTITY_VALUE_PATH_FIELD,
      ''
    ) as string;
    const anomaliesSummary = get(
      entityAnomalySummaries,
      'anomalySummaries',
      []
    ) as EntityAnomalySummary[];
    entityValues.push(entityValue);

    timeWindows.forEach((timeWindow) => {
      const anomalySummaryInTimeRange = anomaliesSummary.filter(
        (singleAnomalySummary) =>
          singleAnomalySummary.startTime >= timeWindow.startDate &&
          singleAnomalySummary.startTime < timeWindow.endDate
      );

      if (isEmpty(anomalySummaryInTimeRange)) {
        maxAnomalyGradesForEntity.push(0);
        numAnomalyGradesForEntity.push(0);
        return;
      }

      const maxAnomalies = anomalySummaryInTimeRange.map((anomalySummary) => {
        return toFixedNumberForAnomaly(
          defaultTo(get(anomalySummary, 'maxAnomaly'), 0)
        );
      });
      const countAnomalies = anomalySummaryInTimeRange.map((anomalySummary) => {
        return defaultTo(get(anomalySummary, 'anomalyCount'), 0);
      });

      maxAnomalyGradesForEntity.push(Math.max(...maxAnomalies));
      numAnomalyGradesForEntity.push(
        countAnomalies.reduce((a, b) => {
          return a + b;
        })
      );
    });

    maxAnomalyGrades.push(maxAnomalyGradesForEntity);
    numAnomalyGrades.push(numAnomalyGradesForEntity);
  });

  const plotTimes = timeWindows.map((timeWindow) => timeWindow.startDate);
  const timeStamps = plotTimes.map((timestamp) =>
    moment(timestamp).format(HEATMAP_X_AXIS_DATE_FORMAT)
  );
  const plotData = buildHeatmapPlotData(
    timeStamps,
    entityValues.reverse(),
    maxAnomalyGrades.reverse(),
    numAnomalyGrades.reverse(),
    timeWindows[0].endDate - timeWindows[0].startDate
  );
  return [plotData];
};

const getEntityAnomaliesMap = (
  anomalies: any[] | undefined
): Map<string, any[]> => {
  const entityAnomaliesMap = new Map<string, any[]>();
  if (anomalies == undefined) {
    return entityAnomaliesMap;
  }
  anomalies.forEach((anomaly) => {
    const entity = get(anomaly, 'entity', [] as EntityData[]);
    if (isEmpty(entity)) {
      return;
    }
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

const filterEntityAnomalyResultMap = (
  entityAnomalyResultMap: Map<string, any[]>
) => {
  const entityAnomaliesMap = new Map<string, any[]>();
  entityAnomalyResultMap.forEach((entityAnomalies, entity) => {
    if (
      !isEmpty(entityAnomalies) &&
      !isEmpty(
        entityAnomalies.filter((anomaly) => get(anomaly, 'anomalyGrade', 0) > 0)
      )
    ) {
      entityAnomaliesMap.set(entity, entityAnomalies);
    }
  });
  return entityAnomaliesMap;
};

export const filterHeatmapPlotDataByY = (
  heatmapData: PlotData,
  selectedYs: Datum[],
  sortType: AnomalyHeatmapSortType
) => {
  const originalYs = cloneDeep(heatmapData.y);
  const originalZs = cloneDeep(heatmapData.z);
  const originalTexts = cloneDeep(heatmapData.text);
  const resultYs = [];
  const resultZs = [];
  const resultTexts = [];
  for (let i = 0; i < originalYs.length; i++) {
    //@ts-ignore
    if (selectedYs.includes(originalYs[i])) {
      resultYs.push(originalYs[i]);
      resultZs.push(originalZs[i]);
      resultTexts.push(originalTexts[i]);
    }
  }
  const updateHeatmapPlotData = {
    ...cloneDeep(heatmapData),
    y: resultYs,
    z: resultZs,
    text: resultTexts,
  } as PlotData;
  return sortHeatmapPlotData(
    updateHeatmapPlotData,
    sortType,
    selectedYs.length
  );
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
  const sortedYIndices = orderBy(yIndicesToSort, ['value'], 'desc').slice(
    0,
    topNum
  );
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
  const colorForCell = getHeatmapColorByValue(selectedValue);
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

export const getAnomalyGradeWording = (isNotSample: boolean | undefined) => {
  return isNotSample ? 'Anomaly grade' : 'Sample anomaly grade';
};

export const getConfidenceWording = (isNotSample: boolean | undefined) => {
  return isNotSample ? 'Confidence' : 'Sample confidence';
};

export const getFeatureBreakdownWording = (
  isNotSample: boolean | undefined
) => {
  return isNotSample ? 'Feature breakdown' : 'Sample feature breakdown';
};

export const getFeatureDataWording = (isNotSample: boolean | undefined) => {
  return isNotSample ? 'Feature output' : 'Sample feature output';
};

export const getLastAnomalyOccurrenceWording = (
  isNotSample: boolean | undefined
) => {
  return isNotSample
    ? 'Last anomaly occurrence'
    : 'Last sample anomaly occurrence';
};

export const getAnomalyOccurrenceWording = (
  isNotSample: boolean | undefined
) => {
  return isNotSample ? 'Anomaly occurrences' : 'Sample anomaly occurrences';
};

export const getAnomalyHistoryWording = (isNotSample: boolean | undefined) => {
  return isNotSample ? 'Anomaly history' : 'Sample anomaly history';
};

export const getDateRangeWithSelectedHeatmapCell = (
  originalDateRange: DateRange,
  isHCDetector: boolean | undefined,
  heatmapCell: HeatmapCell | undefined
) => {
  if (isHCDetector && heatmapCell) {
    return heatmapCell.dateRange;
  }
  return originalDateRange;
};
