/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { SORT_DIRECTION } from '../../../utils/constants';
import {
  convertDetectorKeysToCamelCase,
  convertDetectorKeysToSnakeCase,
  getResultAggregationQuery,
} from '../adHelpers';

describe('adHelpers', () => {
  describe('convertDetectorKeysToSnakeCase', () => {
    test('should convert keys to snake_case', () => {
      const snake = convertDetectorKeysToSnakeCase({ helloWorld: 'value' });
      expect(snake).toEqual({
        hello_world: 'value',
        filter_query: {},
        ui_metadata: {},
        feature_attributes: [],
      });
    });
    test('should not convert keys to snake_case for filterQuery and features aggregation query', () => {
      const snake = convertDetectorKeysToSnakeCase({
        helloWorld: 'value',
        filterQuery: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        featureAttributes: [
          {
            featureId: 'WDO-lm0BL33kEAPF5moe',
            featureName: 'Hello World',
            featureEnabled: true,
            aggregationQuery: {
              hello_world: {
                avg: {
                  field: 'bytes',
                },
              },
            },
          },
        ],
      });
      expect(snake).toEqual({
        hello_world: 'value',
        feature_attributes: [
          {
            feature_id: 'WDO-lm0BL33kEAPF5moe',
            feature_name: 'Hello World',
            feature_enabled: true,
            aggregation_query: {
              hello_world: {
                avg: {
                  field: 'bytes',
                },
              },
            },
          },
        ],
        filter_query: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        ui_metadata: {},
      });
    });

    test('should not convert keys to snake_case for uiMetadata', () => {
      const snake = convertDetectorKeysToSnakeCase({
        helloWorld: 'value',
        filterQuery: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        uiMetadata: { newFeatures: [{ featureName: 'Name' }] },
      });
      expect(snake).toEqual({
        hello_world: 'value',
        feature_attributes: [],
        filter_query: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        ui_metadata: { newFeatures: [{ featureName: 'Name' }] },
      });
    });
  });
  describe('convertDetectorKeysToCamelCase', () => {
    test('should convert keys to camelCase', () => {
      const camelCase = convertDetectorKeysToCamelCase({
        hello_world: 'value',
        filter_query: {},
        ui_metadata: {},
      });
      expect(camelCase).toEqual({
        helloWorld: 'value',
        filterQuery: {},
        uiMetadata: {},
        featureAttributes: [],
      });
    });
    test('should not convert keys to camelCase for filterQuery', () => {
      const camelCase = convertDetectorKeysToCamelCase({
        hello_world: 'value',
        feature_attributes: [
          {
            feature_id: 'WDO-lm0BL33kEAPF5moe',
            feature_name: 'Hello World',
            feature_enabled: true,
            aggregation_query: {
              hello_world: {
                avg: {
                  field: 'bytes',
                },
              },
            },
          },
        ],
        filter_query: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        ui_metadata: {},
      });
      expect(camelCase).toEqual({
        helloWorld: 'value',
        featureAttributes: [
          {
            featureId: 'WDO-lm0BL33kEAPF5moe',
            featureName: 'Hello World',
            featureEnabled: true,
            aggregationQuery: {
              hello_world: {
                avg: {
                  field: 'bytes',
                },
              },
            },
          },
        ],
        filterQuery: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        uiMetadata: {},
      });
    });

    test('should not convert keys to camelCase for uiMetadata', () => {
      const camelCase = convertDetectorKeysToCamelCase({
        hello_world: 'value',
        filter_query: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        ui_metadata: { newFeatures: [{ featureName: 'Name' }] },
      });
      expect(camelCase).toEqual({
        helloWorld: 'value',
        filterQuery: {
          query: {
            aggs: { sum_aggregation: { sum: { field: 'totalSales' } } },
          },
        },
        uiMetadata: { newFeatures: [{ featureName: 'Name' }] },
        featureAttributes: [],
      });
    });
  });
  describe('getResultAggregationQuery', () => {
    test('should return query without sorting', () => {
      const aggsQuery = getResultAggregationQuery(
        ['detector_1', 'detector_2'],
        {
          from: 0,
          size: 20,
          search: '',
          sortField: 'name',
          sortDirection: SORT_DIRECTION.ASC,
        }
      );
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: {
              terms: {
                detector_id: ['detector_1', 'detector_2'],
              },
            },
          },
        },
        aggs: {
          unique_detectors: {
            terms: {
              field: 'detector_id',
              size: 20,
            },
            aggs: {
              total_anomalies_in_24hr: {
                filter: {
                  range: { start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'start_time' } },
            },
          },
        },
      });
    });
    test('should return query with sorting on last 24 hours anomalies', () => {
      const aggsQuery = getResultAggregationQuery(
        ['detector_1', 'detector_2'],
        {
          from: 0,
          size: 20,
          search: '',
          sortField: 'totalAnomalies',
          sortDirection: SORT_DIRECTION.ASC,
        }
      );
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: {
              terms: {
                detector_id: ['detector_1', 'detector_2'],
              },
            },
          },
        },
        aggs: {
          unique_detectors: {
            terms: {
              field: 'detector_id',
              size: 20,
              order: {
                total_anomalies_in_24hr: 'asc',
              },
            },
            aggs: {
              total_anomalies_in_24hr: {
                filter: {
                  range: { start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'start_time' } },
            },
          },
        },
      });
    });
    test('should return query with sorting on latest_anomaly_time', () => {
      const aggsQuery = getResultAggregationQuery(['detector_1'], {
        from: 0,
        size: 20,
        search: '',
        sortField: 'latestAnomalyTime',
        sortDirection: SORT_DIRECTION.DESC,
      });
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: {
              terms: {
                detector_id: ['detector_1'],
              },
            },
          },
        },
        aggs: {
          unique_detectors: {
            terms: {
              field: 'detector_id',
              size: 20,
              order: {
                latest_anomaly_time: 'desc',
              },
            },
            aggs: {
              total_anomalies_in_24hr: {
                filter: {
                  range: { start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'start_time' } },
            },
          },
        },
      });
    });
    test('should return query with correct from in term aggregation', () => {
      const aggsQuery = getResultAggregationQuery(['detector_1'], {
        from: 10,
        size: 20,
        search: '',
        sortField: 'latestAnomalyTime',
        sortDirection: SORT_DIRECTION.DESC,
      });
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: {
              terms: {
                detector_id: ['detector_1'],
              },
            },
          },
        },
        aggs: {
          unique_detectors: {
            terms: {
              field: 'detector_id',
              size: 30,
              order: {
                latest_anomaly_time: 'desc',
              },
            },
            aggs: {
              total_anomalies_in_24hr: {
                filter: {
                  range: { start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'start_time' } },
            },
          },
        },
      });
    });
  });
});
