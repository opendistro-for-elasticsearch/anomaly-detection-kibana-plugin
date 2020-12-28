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

import { get, isEmpty, orderBy } from 'lodash';
import moment from 'moment';
import { Dispatch } from 'redux';
import {
  AD_DOC_FIELDS,
  MIN_IN_MILLI_SECS,
  SORT_DIRECTION,
} from '../../../server/utils/constants';
import { toFixedNumberForAnomaly } from '../../../server/utils/helpers';
import {
  Anomalies,
  AnomalyData,
  AnomalySummary,
  DateRange,
  Detector,
  FeatureAggregationData,
  FeatureAttributes,
} from '../../models/interfaces';
import { getDetectorLiveResults } from '../../redux/reducers/liveAnomalyResults';
import {
  MAX_ANOMALIES,
  MISSING_FEATURE_DATA_SEVERITY,
} from '../../utils/constants';
import { HeatmapCell } from '../AnomalyCharts/containers/AnomalyHeatmapChart';
import { DETECTOR_INIT_FAILURES } from '../DetectorDetail/utils/constants';
import { dateFormatter, minuteDateFormatter } from './helpers';

export const getQueryParamsForLiveAnomalyResults = (
  detectionInterval: number,
  intervals: number
) => {
  const startTime = moment()
    .subtract(intervals * detectionInterval, 'minutes')
    .valueOf();
  const updatedParams = {
    from: 0,
    size: intervals,
    sortDirection: SORT_DIRECTION.DESC,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    dateRangeFilter: {
      startTime: startTime.valueOf(),
      fieldName: AD_DOC_FIELDS.DATA_START_TIME,
    },
  };
  return updatedParams;
};

export const getLiveAnomalyResults = (
  dispatch: Dispatch<any>,
  detectorId: string,
  detectionInterval: number,
  intervals: number
) => {
  const queryParams = getQueryParamsForLiveAnomalyResults(
    detectionInterval,
    intervals
  );
  dispatch(getDetectorLiveResults(detectorId, queryParams, false));
};

export const buildParamsForGetAnomalyResultsWithDateRange = (
  startTime: number,
  endTime: number,
  anomalyOnly: boolean = false
) => {
  return {
    from: 0,
    size: MAX_ANOMALIES,
    sortDirection: SORT_DIRECTION.DESC,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    startTime: startTime,
    endTime: endTime,
    fieldName: AD_DOC_FIELDS.DATA_START_TIME,
    anomalyThreshold: anomalyOnly ? 0 : -1,
  };
};

const MAX_DATA_POINTS = 1000;
const MAX_FEATURE_ANNOTATIONS = 100;

const calculateStep = (total: number): number => {
  return Math.ceil(total / MAX_DATA_POINTS);
};

export const calculateTimeWindowsWithMaxDataPoints = (
  maxDataPoints: number,
  dateRange: DateRange
): DateRange[] => {
  const resultSampleWindows = [] as DateRange[];
  const rangeInMilliSec = dateRange.endDate - dateRange.startDate;
  const windowSizeinMilliSec = Math.max(
    Math.ceil(rangeInMilliSec / maxDataPoints),
    MIN_IN_MILLI_SECS
  );
  for (
    let currentTime = dateRange.startDate;
    currentTime < dateRange.endDate;
    currentTime += windowSizeinMilliSec
  ) {
    resultSampleWindows.push({
      startDate: currentTime,
      endDate: Math.min(currentTime + windowSizeinMilliSec, dateRange.endDate),
    } as DateRange);
  }
  return resultSampleWindows;
};

// If array size is 100K, `findAnomalyWithMaxAnomalyGrade`
// takes less than 2ms by average, while `Array#reduce`
// takes about 16ms by average and`Array#sort`
// takes about 3ms by average.
// If array size is 1M, `findAnomalyWithMaxAnomalyGrade`
// takes less than 6ms by average, while `Array#reduce`
// takes about 170ms by average and`Array#sort` takes about
//  80ms by average.
// Considering performance impact, will not change this
// method currently.
function findAnomalyWithMaxAnomalyGrade(anomalies: any[]) {
  let anomalyWithMaxGrade = anomalies[0];
  for (let i = 1, len = anomalies.length; i < len; i++) {
    let anomaly = anomalies[i];
    anomalyWithMaxGrade =
      anomaly.anomalyGrade > anomalyWithMaxGrade.anomalyGrade
        ? anomaly
        : anomalyWithMaxGrade;
  }
  return anomalyWithMaxGrade;
}

const sampleMaxAnomalyGrade = (anomalies: any[]): any[] => {
  const step = calculateStep(anomalies.length);
  let index = 0;
  const sampledAnomalies = [];
  while (index < anomalies.length) {
    const arr = anomalies.slice(index, index + step);
    sampledAnomalies.push(findAnomalyWithMaxAnomalyGrade(arr));
    index = index + step;
  }
  return sampledAnomalies;
};

export const prepareDataForLiveChart = (
  data: any[],
  dateRange: DateRange,
  interval: number
) => {
  if (!data || data.length === 0) {
    return [];
  }

  let anomalies = [];
  for (
    let time = dateRange.endDate;
    time > dateRange.startDate;
    time -= MIN_IN_MILLI_SECS * interval
  ) {
    anomalies.push({
      startTime: time,
      endTime: time,
      plotTime: time,
      confidence: null,
      anomalyGrade: null,
    });
  }

  anomalies.push({
    startTime: dateRange.startDate,
    endTime: dateRange.startDate,
    plotTime: dateRange.startDate,
    confidence: null,
    anomalyGrade: null,
  });
  return anomalies;
};

export const prepareDataForChart = (
  data: any[],
  dateRange: DateRange,
  withoutPadding?: boolean
) => {
  let anomalies = [];
  if (data && data.length > 0) {
    anomalies = data.filter(
      (anomaly) =>
        anomaly.plotTime >= dateRange.startDate &&
        anomaly.plotTime <= dateRange.endDate
    );
    if (anomalies.length > MAX_DATA_POINTS) {
      anomalies = sampleMaxAnomalyGrade(anomalies);
    }
  }
  if (withoutPadding) {
    // just return result if padding/placeholder data is not needed
    return anomalies;
  }
  anomalies.push({
    startTime: dateRange.startDate,
    endTime: dateRange.startDate,
    plotTime: dateRange.startDate,
    confidence: null,
    anomalyGrade: null,
  });
  anomalies.unshift({
    startTime: dateRange.endDate,
    endTime: dateRange.endDate,
    plotTime: dateRange.endDate,
    confidence: null,
    anomalyGrade: null,
  });
  return anomalies;
};

export const generateAnomalyAnnotations = (anomalies: any[]): any[] => {
  return anomalies
    .filter((anomaly: AnomalyData) => anomaly.anomalyGrade > 0)
    .map((anomaly: AnomalyData) => ({
      coordinates: {
        x0: anomaly.startTime,
        x1: anomaly.endTime,
      },
      details: `There is an anomaly with confidence ${
        anomaly.confidence
      } between ${moment(anomaly.startTime).format(
        'MM/DD/YY h:mm A'
      )} and ${moment(anomaly.endTime).format('MM/DD/YY h:mm A')}`,
      entity: get(anomaly, 'entity', []),
    }));
};

export const filterWithDateRange = (
  data: any[],
  dateRange: DateRange,
  timeField: string
) => {
  const anomalies = data
    ? data.filter((item) => {
        const time = get(item, `${timeField}`);
        return time && time >= dateRange.startDate && time <= dateRange.endDate;
      })
    : [];
  return anomalies;
};

export const RETURNED_AD_RESULT_FIELDS = [
  'data_start_time',
  'data_end_time',
  'anomaly_grade',
  'confidence',
  'feature_data',
  'entity',
];

export const getAnomalySummaryQuery = (
  startTime: number,
  endTime: number,
  detectorId: string,
  isHistorical?: boolean,
  taskId?: string
) => {
  const termField =
    isHistorical && taskId ? { task_id: taskId } : { detector_id: detectorId };
  return {
    size: MAX_ANOMALIES,
    query: {
      bool: {
        filter: [
          {
            range: {
              data_end_time: {
                gte: startTime,
                lte: endTime,
              },
            },
          },
          {
            range: {
              anomaly_grade: {
                gt: 0,
              },
            },
          },
          {
            term: termField,
          },
        ],
      },
    },
    aggs: {
      count_anomalies: {
        value_count: {
          field: 'anomaly_grade',
        },
      },
      max_confidence: {
        max: {
          field: 'confidence',
        },
      },
      min_confidence: {
        min: {
          field: 'confidence',
        },
      },
      max_anomaly_grade: {
        max: {
          field: 'anomaly_grade',
        },
      },
      min_anomaly_grade: {
        min: {
          field: 'anomaly_grade',
        },
      },
      avg_anomaly_grade: {
        avg: {
          field: 'anomaly_grade',
        },
      },
      max_data_end_time: {
        max: {
          field: 'data_end_time',
        },
      },
    },
    _source: {
      includes: RETURNED_AD_RESULT_FIELDS,
    },
  };
};

export const getBucketizedAnomalyResultsQuery = (
  startTime: number,
  endTime: number,
  interval: number,
  detectorId: string,
  isHistorical?: boolean,
  taskId?: string
) => {
  const termField =
    isHistorical && taskId ? { task_id: taskId } : { detector_id: detectorId };
  const fixedInterval = Math.ceil(
    (endTime - startTime) / (interval * MIN_IN_MILLI_SECS * MAX_DATA_POINTS)
  );
  return {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              data_end_time: {
                gte: startTime,
                lte: endTime,
              },
            },
          },
          {
            term: termField,
          },
        ],
      },
    },
    aggs: {
      bucketized_anomaly_grade: {
        date_histogram: {
          field: 'data_end_time',
          fixed_interval: `${fixedInterval}m`,
        },
        aggs: {
          top_anomaly_hits: {
            top_hits: {
              sort: [
                {
                  anomaly_grade: {
                    order: 'desc',
                  },
                },
              ],
              _source: {
                includes: RETURNED_AD_RESULT_FIELDS,
              },
              size: 1,
            },
          },
        },
      },
    },
  };
};

export const parseBucketizedAnomalyResults = (result: any): Anomalies => {
  const rawAnomalies = get(
    result,
    'response.aggregations.bucketized_anomaly_grade.buckets',
    []
  ) as any[];
  let anomalies = [] as AnomalyData[];
  let featureData = {} as { [key: string]: FeatureAggregationData[] };
  rawAnomalies.forEach((item) => {
    if (get(item, 'top_anomaly_hits.hits.hits', []).length > 0) {
      const rawAnomaly = get(item, 'top_anomaly_hits.hits.hits.0._source');
      if (
        get(rawAnomaly, 'anomaly_grade') !== undefined &&
        get(rawAnomaly, 'feature_data', []).length > 0
      ) {
        anomalies.push({
          anomalyGrade: toFixedNumberForAnomaly(
            get(rawAnomaly, 'anomaly_grade')
          ),
          confidence: toFixedNumberForAnomaly(get(rawAnomaly, 'confidence')),
          startTime: get(rawAnomaly, 'data_start_time'),
          endTime: get(rawAnomaly, 'data_end_time'),
          plotTime: get(rawAnomaly, 'data_end_time'),
          entity: get(rawAnomaly, 'entity'),
        });
        get(rawAnomaly, 'feature_data', []).forEach((feature) => {
          if (!get(featureData, get(feature, 'feature_id'))) {
            featureData[get(feature, 'feature_id')] = [];
          }
          featureData[get(feature, 'feature_id')].push({
            data: toFixedNumberForAnomaly(get(feature, 'data')),
            startTime: get(rawAnomaly, 'data_start_time'),
            endTime: get(rawAnomaly, 'data_end_time'),
            plotTime: get(rawAnomaly, 'data_end_time'),
          });
        });
      }
    }
  });
  return {
    anomalies: anomalies,
    featureData: featureData,
  };
};

export const parseAnomalySummary = (
  anomalySummaryResult: any
): AnomalySummary => {
  const anomalyCount = get(
    anomalySummaryResult,
    'response.aggregations.count_anomalies.value',
    0
  );
  return {
    anomalyOccurrence: anomalyCount,
    minAnomalyGrade: anomalyCount
      ? toFixedNumberForAnomaly(
          get(
            anomalySummaryResult,
            'response.aggregations.min_anomaly_grade.value'
          )
        )
      : 0,
    maxAnomalyGrade: anomalyCount
      ? toFixedNumberForAnomaly(
          get(
            anomalySummaryResult,
            'response.aggregations.max_anomaly_grade.value'
          )
        )
      : 0,
    avgAnomalyGrade: anomalyCount
      ? toFixedNumberForAnomaly(
          get(
            anomalySummaryResult,
            'response.aggregations.avg_anomaly_grade.value'
          )
        )
      : 0,
    minConfidence: anomalyCount
      ? toFixedNumberForAnomaly(
          get(
            anomalySummaryResult,
            'response.aggregations.min_confidence.value'
          )
        )
      : 0,
    maxConfidence: anomalyCount
      ? toFixedNumberForAnomaly(
          get(
            anomalySummaryResult,
            'response.aggregations.max_confidence.value'
          )
        )
      : 0,
    lastAnomalyOccurrence: anomalyCount
      ? minuteDateFormatter(
          get(
            anomalySummaryResult,
            'response.aggregations.max_data_end_time.value'
          )
        )
      : '',
  };
};

export const parsePureAnomalies = (
  anomalySummaryResult: any
): AnomalyData[] => {
  const anomaliesHits = get(anomalySummaryResult, 'response.hits.hits', []);
  const anomalies = [] as AnomalyData[];
  if (anomaliesHits.length > 0) {
    anomaliesHits.forEach((item: any) => {
      const rawAnomaly = get(item, '_source');
      anomalies.push({
        anomalyGrade: toFixedNumberForAnomaly(get(rawAnomaly, 'anomaly_grade')),
        confidence: toFixedNumberForAnomaly(get(rawAnomaly, 'confidence')),
        startTime: get(rawAnomaly, 'data_start_time'),
        endTime: get(rawAnomaly, 'data_end_time'),
        plotTime: get(rawAnomaly, 'data_end_time'),
        entity: get(rawAnomaly, 'entity'),
      });
    });
  }
  return anomalies;
};

export type FeatureDataPoint = {
  isMissing: boolean;
  plotTime: number;
  startTime: number;
  endTime: number;
};

export const FEATURE_DATA_CHECK_WINDOW_OFFSET = 2;

export const getFeatureDataPoints = (
  featureData: FeatureAggregationData[],
  interval: number,
  dateRange: DateRange | undefined
): FeatureDataPoint[] => {
  const featureDataPoints = [] as FeatureDataPoint[];
  if (!dateRange) {
    return featureDataPoints;
  }

  const existingTimes = isEmpty(featureData)
    ? []
    : featureData
        .map((feature) => getRoundedTimeInMin(feature.startTime))
        .filter((featureTime) => featureTime != undefined);
  for (
    let currentTime = getRoundedTimeInMin(dateRange.startDate);
    currentTime <
    // skip checking for latest interval as data point for it may not be delivered in time
    getRoundedTimeInMin(
      dateRange.endDate -
        FEATURE_DATA_CHECK_WINDOW_OFFSET * interval * MIN_IN_MILLI_SECS
    );
    currentTime += interval * MIN_IN_MILLI_SECS
  ) {
    const isExisting = findTimeExistsInWindow(
      existingTimes,
      getRoundedTimeInMin(currentTime),
      getRoundedTimeInMin(currentTime) + interval * MIN_IN_MILLI_SECS
    );
    featureDataPoints.push({
      isMissing: !isExisting,
      plotTime: currentTime + interval * MIN_IN_MILLI_SECS,
      startTime: currentTime,
      endTime: currentTime + interval * MIN_IN_MILLI_SECS,
    });
  }

  return featureDataPoints;
};

const findTimeExistsInWindow = (
  timestamps: any[],
  startTime: number,
  endTime: number
): boolean => {
  // timestamps is in desc order
  let result = false;
  if (isEmpty(timestamps)) {
    return result;
  }

  let left = 0;
  let right = timestamps.length - 1;
  while (left <= right) {
    let middle = Math.floor((right + left) / 2);
    if (timestamps[middle] >= startTime && timestamps[middle] < endTime) {
      result = true;
      break;
    }
    if (timestamps[middle] < startTime) {
      right = middle - 1;
    }
    if (timestamps[middle] >= endTime) {
      left = middle + 1;
    }
  }
  return result;
};

const getRoundedTimeInMin = (timestamp: number): number => {
  return Math.round(timestamp / MIN_IN_MILLI_SECS) * MIN_IN_MILLI_SECS;
};

const sampleFeatureMissingDataPoints = (
  featureMissingDataPoints: FeatureDataPoint[],
  dateRange?: DateRange
): FeatureDataPoint[] => {
  if (!dateRange) {
    return featureMissingDataPoints;
  }
  const sampleTimeWindows = calculateTimeWindowsWithMaxDataPoints(
    MAX_FEATURE_ANNOTATIONS,
    dateRange
  );

  const sampledResults = [] as FeatureDataPoint[];
  for (const timeWindow of sampleTimeWindows) {
    const sampledDataPoint = getMiddleDataPoint(
      getDataPointsInWindow(featureMissingDataPoints, timeWindow)
    );
    if (sampledDataPoint) {
      sampledResults.push({
        ...sampledDataPoint,
        startTime: Math.min(timeWindow.startDate, sampledDataPoint.startTime),
        endTime: Math.max(timeWindow.endDate, sampledDataPoint.endTime),
      } as FeatureDataPoint);
    }
  }

  return sampledResults;
};

const getMiddleDataPoint = (arr: any[]) => {
  if (arr && arr.length > 0) {
    return arr[Math.floor(arr.length / 2)];
  }
  return undefined;
};

const getDataPointsInWindow = (
  dataPoints: FeatureDataPoint[],
  timeWindow: DateRange
) => {
  return dataPoints.filter(
    (dataPoint) =>
      get(dataPoint, 'plotTime', 0) >= timeWindow.startDate &&
      get(dataPoint, 'plotTime', 0) < timeWindow.endDate
  );
};

const generateFeatureMissingAnnotations = (
  featureMissingDataPoints: FeatureDataPoint[]
) => {
  return featureMissingDataPoints.map((feature) => ({
    dataValue: feature.plotTime,
    details: `There is feature data point missing between ${moment(
      feature.startTime
    ).format('MM/DD/YY h:mm A')} and ${moment(feature.endTime).format(
      'MM/DD/YY h:mm A'
    )}`,
    header: dateFormatter(feature.plotTime),
  }));
};

const finalizeFeatureMissingDataAnnotations = (
  featureMissingDataPoints: any[],
  dateRange?: DateRange
) => {
  const sampledFeatureMissingDataPoints = sampleFeatureMissingDataPoints(
    featureMissingDataPoints,
    dateRange
  );

  return generateFeatureMissingAnnotations(sampledFeatureMissingDataPoints);
};

export const getFeatureMissingDataAnnotations = (
  featureData: FeatureAggregationData[],
  interval: number,
  queryDateRange?: DateRange,
  displayDateRange?: DateRange
) => {
  const featureMissingDataPoints = getFeatureDataPoints(
    featureData,
    interval,
    queryDateRange
  ).filter((dataPoint) => get(dataPoint, 'isMissing', false));

  const featureMissingAnnotations = finalizeFeatureMissingDataAnnotations(
    featureMissingDataPoints,
    displayDateRange
  );
  return featureMissingAnnotations;
};

// returns feature data points(missing/existing both included) for detector in a map like
// {
//    'featureName': data points[]
// }
export const getFeatureDataPointsForDetector = (
  detector: Detector,
  featuresData: { [key: string]: FeatureAggregationData[] },
  interval: number,
  dateRange?: DateRange
) => {
  let featureDataPointsForDetector = {} as {
    [key: string]: FeatureDataPoint[];
  };

  const allFeatures = get(
    detector,
    'featureAttributes',
    [] as FeatureAttributes[]
  );
  allFeatures.forEach((feature) => {
    //@ts-ignore
    const featureData = featuresData[feature.featureId];
    const featureDataPoints = getFeatureDataPoints(
      featureData,
      interval,
      dateRange
    );
    featureDataPointsForDetector = {
      ...featureDataPointsForDetector,
      [feature.featureName]: featureDataPoints,
    };
  });
  return featureDataPointsForDetector;
};

export const getFeatureMissingSeverities = (featuresDataPoint: {
  [key: string]: FeatureDataPoint[];
}): Map<MISSING_FEATURE_DATA_SEVERITY, string[]> => {
  const featureMissingSeverities = new Map();

  for (const [featureName, featureDataPoints] of Object.entries(
    featuresDataPoint
  )) {
    // all feature data points should have same length
    let featuresWithMissingData = [] as string[];
    if (featureDataPoints.length <= 1) {
      // return empty map
      return featureMissingSeverities;
    }
    if (
      featureDataPoints.length === 2 &&
      featureDataPoints[0].isMissing &&
      featureDataPoints[1].isMissing
    ) {
      if (featureMissingSeverities.has(MISSING_FEATURE_DATA_SEVERITY.YELLOW)) {
        featuresWithMissingData = featureMissingSeverities.get(
          MISSING_FEATURE_DATA_SEVERITY.YELLOW
        );
      }
      featuresWithMissingData.push(featureName);
      featureMissingSeverities.set(
        MISSING_FEATURE_DATA_SEVERITY.YELLOW,
        featuresWithMissingData
      );
      continue;
    }

    const orderedFeatureDataPoints = orderBy(
      featureDataPoints,
      // sort by plot time in desc order
      (dataPoint) => get(dataPoint, 'plotTime', 0),
      SORT_DIRECTION.DESC
    );
    // feature has >= 3 data points
    if (
      orderedFeatureDataPoints.length >= 3 &&
      orderedFeatureDataPoints[0].isMissing &&
      orderedFeatureDataPoints[1].isMissing
    ) {
      // at least latest 2 ones are missing
      let currentSeverity = MISSING_FEATURE_DATA_SEVERITY.YELLOW;
      if (orderedFeatureDataPoints[2].isMissing) {
        // all the latest 3 ones are missing
        currentSeverity = MISSING_FEATURE_DATA_SEVERITY.RED;
      }
      if (featureMissingSeverities.has(currentSeverity)) {
        featuresWithMissingData = featureMissingSeverities.get(currentSeverity);
      }
      featuresWithMissingData.push(featureName);
      featureMissingSeverities.set(currentSeverity, featuresWithMissingData);
    }
  }

  return featureMissingSeverities;
};

export const getFeatureDataMissingMessageAndActionItem = (
  featureMissingSev: MISSING_FEATURE_DATA_SEVERITY | undefined,
  featuresWithMissingData: string[],
  hideFeatureMessage: boolean
) => {
  switch (featureMissingSev) {
    case MISSING_FEATURE_DATA_SEVERITY.YELLOW:
      return {
        message: `Recent data is missing for feature${
          featuresWithMissingData.length > 1 ? 's' : ''
        }: ${featuresWithMissingData.join(
          ', '
        )}. So, anomaly result is missing during this time.`,
        actionItem:
          'Make sure your data is ingested correctly.' + hideFeatureMessage
            ? ''
            : ' See the feature data shown below for more details.',
      };
    case MISSING_FEATURE_DATA_SEVERITY.RED:
      return {
        message: `Data is not being ingested correctly for feature${
          featuresWithMissingData.length > 1 ? 's' : ''
        }: ${featuresWithMissingData.join(
          ', '
        )}. So, anomaly result is missing during this time.`,
        actionItem:
          `${DETECTOR_INIT_FAILURES.NO_TRAINING_DATA.actionItem}` +
          hideFeatureMessage
            ? ''
            : ' See the feature data shown below for more details.',
      };
    default:
      return {
        message: '',
        actionItem: '',
      };
  }
};

export const filterWithHeatmapFilter = (
  data: any[],
  heatmapCell: HeatmapCell | undefined,
  isFilteringWithEntity: boolean = true,
  timeField: string = 'plotTime'
) => {
  if (!heatmapCell) {
    return data;
  }

  if (isFilteringWithEntity) {
    data = data
      .filter((anomaly) => !isEmpty(get(anomaly, 'entity', [])))
      .filter(
        (anomaly) => get(anomaly, 'entity')[0].value === heatmapCell.entityValue
      );
  }
  return filterWithDateRange(data, heatmapCell.dateRange, timeField);
};
