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

import {
  SORT_DIRECTION,
  AD_DOC_FIELDS,
  MIN_IN_MILLI_SECS,
} from '../../../server/utils/constants';
import { getDetectorResults } from '../../redux/reducers/anomalyResults';
import { getDetectorLiveResults } from '../../redux/reducers/liveAnomalyResults';
import moment from 'moment';
import { Dispatch } from 'redux';
import { get } from 'lodash';
import {
  AnomalyData,
  DateRange,
  AnomalySummary,
  FeatureAggregationData,
  Anomalies,
} from '../../models/interfaces';
import { MAX_ANOMALIES } from '../../utils/constants';
import { minuteDateFormatter } from './helpers';
import { toFixedNumber } from '../../../server/utils/helpers';

export const getLiveAnomalyResults = (
  dispatch: Dispatch<any>,
  detectorId: string,
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
  dispatch(getDetectorLiveResults(detectorId, updatedParams));
};

export const getAnomalyResultsWithDateRange = (
  dispatch: Dispatch<any>,
  startTime: number,
  endTime: number,
  detectorId: string
) => {
  const updatedParams = {
    from: 0,
    size: MAX_ANOMALIES,
    sortDirection: SORT_DIRECTION.DESC,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    dateRangeFilter: {
      startTime: startTime,
      endTime: endTime,
      fieldName: AD_DOC_FIELDS.DATA_START_TIME,
    },
  };
  dispatch(getDetectorResults(detectorId, updatedParams));
};

const MAX_DATA_POINTS = 1000;

const calculateStep = (total: number): number => {
  return Math.ceil(total / MAX_DATA_POINTS);
};

//TODO: sorting and find the maximum value?
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
) => {
  if (!data || data.length === 0) {
    return [];
  }
  let anomalies = data.filter(
    anomaly =>
      anomaly.plotTime >= dateRange.startDate &&
      anomaly.plotTime <= dateRange.endDate
  );
  if (anomalies.length > MAX_DATA_POINTS) {
    anomalies = sampleMaxAnomalyGrade(anomalies);
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
    }));
};

export const filterWithDateRange = (
  data: any[],
  dateRange: DateRange,
  timeField: string
) => {
  const anomalies = data
    ? data.filter(item => {
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
];

export const getAnomalySummaryQuery = (
  startTime: number,
  endTime: number,
  detectorId: string
) => {
  return {
    index: '.opendistro-anomaly-results*',
    size: MAX_ANOMALIES,
    rawQuery: {
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
              term: {
                detector_id: detectorId,
              },
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
        max_data_end_time: {
          max: {
            field: 'data_end_time',
          },
        },
      },
      _source: {
        includes: RETURNED_AD_RESULT_FIELDS,
      },
    },
  };
};

export const getBucketizedAnomalyResultsQuery = (
  startTime: number,
  endTime: number,
  interval: number,
  detectorId: string
) => {
  const fixedInterval = Math.ceil(
    (endTime - startTime) / (interval * MIN_IN_MILLI_SECS * MAX_DATA_POINTS)
  );
  return {
    index: '.opendistro-anomaly-results*',
    size: 0,
    rawQuery: {
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
              term: {
                detector_id: detectorId,
              },
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
    },
  };
};

export const parseBucketizedAnomalyResults = (result: any): Anomalies => {
  const rawAnomalies = get(
    result,
    'data.response.aggregations.bucketized_anomaly_grade.buckets',
    []
  ) as any[];
  let anomalies = [] as AnomalyData[];
  let featureData = {} as { [key: string]: FeatureAggregationData[] };
  rawAnomalies.forEach(item => {
    if (get(item, 'top_anomaly_hits.hits.hits', []).length > 0) {
      const rawAnomaly = get(item, 'top_anomaly_hits.hits.hits.0._source');
      if (get(rawAnomaly, 'anomaly_grade') !== undefined) {
        anomalies.push({
          anomalyGrade: toFixedNumber(get(rawAnomaly, 'anomaly_grade')),
          confidence: toFixedNumber(get(rawAnomaly, 'confidence')),
          startTime: get(rawAnomaly, 'data_start_time'),
          endTime: get(rawAnomaly, 'data_end_time'),
          plotTime: get(rawAnomaly, 'data_end_time'),
        });
      }
      if (get(rawAnomaly, 'feature_data', []).length > 0) {
        get(rawAnomaly, 'feature_data', []).forEach(feature => {
          if (!get(featureData, get(feature, 'feature_id'))) {
            featureData[get(feature, 'feature_id')] = [];
          }
          featureData[get(feature, 'feature_id')].push({
            data: toFixedNumber(get(feature, 'data')),
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
    'data.response.aggregations.count_anomalies.value',
    0
  );
  return {
    anomalyOccurrence: anomalyCount,
    minAnomalyGrade: anomalyCount
      ? toFixedNumber(
          get(
            anomalySummaryResult,
            'data.response.aggregations.min_anomaly_grade.value'
          )
        )
      : 0,
    maxAnomalyGrade: anomalyCount
      ? toFixedNumber(
          get(
            anomalySummaryResult,
            'data.response.aggregations.max_anomaly_grade.value'
          )
        )
      : 0,
    minConfidence: anomalyCount
      ? toFixedNumber(
          get(
            anomalySummaryResult,
            'data.response.aggregations.min_confidence.value'
          )
        )
      : 0,
    maxConfidence: anomalyCount
      ? toFixedNumber(
          get(
            anomalySummaryResult,
            'data.response.aggregations.max_confidence.value'
          )
        )
      : 0,
    lastAnomalyOccurrence: anomalyCount
      ? minuteDateFormatter(
          get(
            anomalySummaryResult,
            'data.response.aggregations.max_data_end_time.value'
          )
        )
      : '',
  };
};

export const parsePureAnomalies = (
  anomalySummaryResult: any
): AnomalyData[] => {
  const anomaliesHits = get(
    anomalySummaryResult,
    'data.response.hits.hits',
    []
  );
  const anomalies = [] as AnomalyData[];
  if (anomaliesHits.length > 0) {
    anomaliesHits.forEach((item: any) => {
      const rawAnomaly = get(item, '_source');
      anomalies.push({
        anomalyGrade: get(rawAnomaly, 'anomaly_grade'),
        confidence: get(rawAnomaly, 'confidence'),
        startTime: get(rawAnomaly, 'data_start_time'),
        endTime: get(rawAnomaly, 'data_end_time'),
        plotTime: get(rawAnomaly, 'data_end_time'),
      });
    });
  }
  return anomalies;
};
