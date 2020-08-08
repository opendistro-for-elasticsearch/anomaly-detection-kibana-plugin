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
  convertPreviewInputKeysToSnakeCase,
} from '../adHelpers';

describe('adHelpers', () => {
  describe('convertPreviewInputKeysToSnakeCase', () => {
    test('should not convert field name to snake_case', () => {
      const snake = convertPreviewInputKeysToSnakeCase({
        periodStart: 1596309273336,
        periodEnd: 1596914073336,
        detector: {
          name: "test2",
          description: "test",
          timeField: "@timestamp",
          indices: [
            "metricbeat-7.8.1"
          ],
          detectionInterval: {
            period: {
              interval: 1,
              unit: "Minutes"
            }
          },
          windowDelay: {
            period: {
              interval: 1,
              unit: "Minutes"
            }
          },
          filterQuery: {
            bool: {
              filter: [
                {
                  term: {
                    "host.name": {
                      value: "myserver"
                    }
                  }
                }
              ]
            }
          },
          featureAttributes: [
            {
              featureId: "9lAlx3MBdAn13oNrKKPk",
              featureName: "F1",
              featureEnabled: true,
              importance: 1,
              aggregationQuery: {
                f_1: {
                  avg: {
                    field: "system.cpu.total.pct"
                  }
                }
              }
            }
          ],
          uiMetadata: {
            features: {
              F1: {
                featureType: "simple_aggs",
                aggregationBy: "avg",
                aggregationOf: "system.cpu.total.pct"
              }
            },
            filters: [
              {
                fieldInfo: [
                  {
                    label: "host.name",
                    type: "keyword"
                  }
                ],
                fieldValue: "myserver",
                operator: "is"
              }
            ],
            filterType: "simple_filter"
          },
        },
      });
      expect(snake).toEqual({
        period_start: 1596309273336,
        period_end: 1596914073336,
        detector: {
          name: "test2",
          description: "test",
          time_field: "@timestamp",
          indices: [
            "metricbeat-7.8.1"
          ],
          detection_interval: {
            period: {
              interval: 1,
              unit: "Minutes"
            }
          },
          window_delay: {
            period: {
              interval: 1,
              unit: "Minutes"
            }
          },
          filter_query: {
            bool: {
              filter: [
                {
                  term: {
                    "host.name": {
                      value: "myserver"
                    }
                  }
                }
              ]
            }
          },
          feature_attributes: [
            {
              feature_id: "9lAlx3MBdAn13oNrKKPk",
              feature_name: "F1",
              feature_enabled: true,
              importance: 1,
              aggregation_query: {
                f_1: {
                  avg: {
                    field: "system.cpu.total.pct"
                  }
                }
              }
            }
          ],
          ui_metadata: {
            features: {
              F1: {
                featureType: "simple_aggs",
                aggregationBy: "avg",
                aggregationOf: "system.cpu.total.pct"
              }
            },
            filters: [
              {
                fieldInfo: [
                  {
                    label: "host.name",
                    type: "keyword"
                  }
                ],
                fieldValue: "myserver",
                operator: "is"
              }
            ],
            filterType: "simple_filter"
          },
        }
      });
    });
  });

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

    test('should not replace dot in filterQuery and features aggregation query', () => {
      const snake = convertDetectorKeysToSnakeCase({
        helloWorld: 'value',
        filterQuery: {
          bool: {
            filter: [
              {
                term: {
                  'host.name': { value: 'myserver' },
                },
              },
            ],
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
                  field: 'system.cpu.total.pct',
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
                  field: 'system.cpu.total.pct',
                },
              },
            },
          },
        ],
        filter_query: {
          bool: {
            filter: [
              {
                term: {
                  'host.name': { value: 'myserver' },
                },
              },
            ],
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
        enabled: false,
        disabledTime: undefined,
        enabledTime: undefined,
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
        disabledTime: undefined,
        enabled: false,
        enabledTime: undefined,
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
        enabled: false,
        disabledTime: undefined,
        enabledTime: undefined,
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
        enabled: false,
        disabledTime: undefined,
        enabledTime: undefined,
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
          indices: '',
          sortField: 'name',
          sortDirection: SORT_DIRECTION.ASC,
        }
      );
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: [
              { terms: { detector_id: ['detector_1', 'detector_2'] } },
              { range: { anomaly_grade: { gt: 0 } } },
            ],
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
                  range: { data_start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'data_start_time' } },
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
          indices: '',
          sortField: 'totalAnomalies',
          sortDirection: SORT_DIRECTION.ASC,
        }
      );
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: [
              { terms: { detector_id: ['detector_1', 'detector_2'] } },
              { range: { anomaly_grade: { gt: 0 } } },
            ],
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
                  range: { data_start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'data_start_time' } },
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
        indices: '',
        sortField: 'latestAnomalyTime',
        sortDirection: SORT_DIRECTION.DESC,
      });
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: [
              { terms: { detector_id: ['detector_1'] } },
              { range: { anomaly_grade: { gt: 0 } } },
            ],
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
                  range: { data_start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'data_start_time' } },
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
        indices: '',
        sortField: 'latestAnomalyTime',
        sortDirection: SORT_DIRECTION.DESC,
      });
      expect(aggsQuery).toEqual({
        size: 0,
        query: {
          bool: {
            must: [
              { terms: { detector_id: ['detector_1'] } },
              { range: { anomaly_grade: { gt: 0 } } },
            ],
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
                  range: { data_start_time: { gte: 'now-24h', lte: 'now' } },
                },
              },
              latest_anomaly_time: { max: { field: 'data_start_time' } },
            },
          },
        },
      });
    });
  });
});
