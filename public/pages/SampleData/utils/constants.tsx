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

//@ts-ignore
import moment from 'moment';
import React from 'react';
import { EuiIcon } from '@elastic/eui';

// same as default Kibana sample data
export const indexSettings = {
  index: {
    number_of_shards: 1,
    auto_expand_replicas: '0-1',
  },
};

export interface SAMPLE_DATA {
  indexName: string;
  detectorName: string;
  description: string;
  icon: any;
  fieldMappings: {};
  indexConfig: {};
  detectorConfig: {};
}

/*
 *** SAMPLE HTTP RESPONSES CONSTANTS ***
 */
const httpResponsesIndexName = 'opendistro-sample-http-responses';
const httpResponsesDetectorName = 'opendistro-sample-http-responses-detector';
const httpFieldMappings = {
  timestamp: {
    type: 'date',
  },
  status_code: {
    type: 'integer',
  },
  http_1xx: {
    type: 'integer',
  },
  http_2xx: {
    type: 'integer',
  },
  http_3xx: {
    type: 'integer',
  },
  http_4xx: {
    type: 'integer',
  },
  http_5xx: {
    type: 'integer',
  },
};
export const sampleHttpResponses = {
  indexName: httpResponsesIndexName,
  detectorName: httpResponsesDetectorName,
  description:
    'Detect high numbers of error response codes in an index containing HTTP response data.',
  icon: <EuiIcon type="visLine" size="l" />,
  fieldMappings: httpFieldMappings,
  indexConfig: {
    index: httpResponsesIndexName,
    body: {
      settings: indexSettings,
      mappings: {
        properties: httpFieldMappings,
      },
    },
  },
  detectorConfig: {
    name: httpResponsesDetectorName,
    description:
      'A sample detector to detect anomalies with HTTP response code logs.',
    time_field: 'timestamp',
    indices: [httpResponsesIndexName],
    featureAttributes: [
      {
        feature_name: 'sum_http_4xx',
        feature_enabled: true,
        importance: 1,
        aggregationQuery: { sum_http_4xx: { sum: { field: 'http_4xx' } } },
      },
      {
        feature_name: 'sum_http_5xx',
        feature_enabled: true,
        importance: 2,
        aggregationQuery: { sum_http_5xx: { sum: { field: 'http_5xx' } } },
      },
    ],
    uiMetadata: {
      features: {
        sum_http_4xx: {
          featureType: 'simple_aggs',
          aggregationBy: 'sum',
          aggregationOf: 'http_4xx',
        },
        sum_http_5xx: {
          featureType: 'simple_aggs',
          aggregationBy: 'sum',
          aggregationOf: 'http_5xx',
        },
      },
      filters: [],
    },
    detection_interval: {
      period: {
        interval: 10,
        unit: 'Minutes',
      },
    },
    window_delay: {
      period: {
        interval: 1,
        unit: 'Minutes',
      },
    },
  },
} as SAMPLE_DATA;

/*
 *** ECOMMERCE CONSTANTS ***
 */
const ecommerceIndexName = 'opendistro-sample-ecommerce';
const ecommerceDetectorName = 'opendistro-sample-ecommerce-detector';
const ecommerceFieldMappings = {
  timestamp: {
    type: 'date',
  },
  order_id: {
    type: 'integer',
  },
  items_purchased_success: {
    type: 'integer',
  },
  items_purchased_failure: {
    type: 'integer',
  },
  total_revenue_usd: {
    type: 'integer',
  },
};
export const sampleEcommerce = {
  indexName: ecommerceIndexName,
  detectorName: ecommerceDetectorName,
  description:
    'Detect any unusual increase or decrease of orders in an index containing online order data.',
  icon: <EuiIcon type="package" size="l" />,
  fieldMappings: ecommerceFieldMappings,
  indexConfig: {
    index: ecommerceIndexName,
    body: {
      settings: indexSettings,
      mappings: {
        properties: ecommerceFieldMappings,
      },
    },
  },
  detectorConfig: {
    name: ecommerceDetectorName,
    description: 'A sample detector to detect anomalies with ecommerce logs.',
    time_field: 'timestamp',
    indices: [ecommerceIndexName],
    featureAttributes: [
      {
        feature_name: 'sum_failed_items',
        feature_enabled: true,
        importance: 1,
        aggregationQuery: {
          sum_failed_items: { sum: { field: 'items_purchased_failure' } },
        },
      },
      {
        feature_name: 'avg_total_revenue',
        feature_enabled: true,
        importance: 2,
        aggregationQuery: {
          avg_total_revenue: { avg: { field: 'total_revenue_usd' } },
        },
      },
      {
        feature_name: 'max_total_revenue',
        feature_enabled: true,
        importance: 3,
        aggregationQuery: {
          max_total_revenue: { max: { field: 'total_revenue_usd' } },
        },
      },
      {
        feature_name: 'min_total_revenue',
        feature_enabled: true,
        importance: 4,
        aggregationQuery: {
          min_total_revenue: { min: { field: 'total_revenue_usd' } },
        },
      },
    ],
    uiMetadata: {
      features: {
        sum_failed_items: {
          featureType: 'simple_aggs',
          aggregationBy: 'sum',
          aggregationOf: 'items_purchased_failure',
        },
        avg_total_revenue: {
          featureType: 'simple_aggs',
          aggregationBy: 'avg',
          aggregationOf: 'total_revenue_usd',
        },
        max_total_revenue: {
          featureType: 'simple_aggs',
          aggregationBy: 'max',
          aggregationOf: 'total_revenue_usd',
        },
        min_total_revenue: {
          featureType: 'simple_aggs',
          aggregationBy: 'min',
          aggregationOf: 'total_revenue_usd',
        },
      },
      filters: [],
    },
    detection_interval: {
      period: {
        interval: 10,
        unit: 'Minutes',
      },
    },
    window_delay: {
      period: {
        interval: 1,
        unit: 'Minutes',
      },
    },
  },
} as SAMPLE_DATA;

/*
 *** HOST HEALTH CONSTANTS ***
 */
const hostHealthIndexName = 'opendistro-sample-host-health';
const hostHealthDetectorName = 'opendistro-sample-host-health-detector';
const hostHealthFieldMappings = {
  timestamp: {
    type: 'date',
  },
  cpu_usage_percentage: {
    type: 'integer',
  },
  memory_usage_percentage: {
    type: 'integer',
  },
};
export const sampleHostHealth = {
  indexName: hostHealthIndexName,
  detectorName: hostHealthDetectorName,
  description:
    'Detect increases in CPU and memory utilization in an index containing various health metrics from a host.',
  icon: <EuiIcon type="visGauge" size="l" />,
  fieldMappings: hostHealthFieldMappings,
  indexConfig: {
    index: hostHealthIndexName,
    body: {
      settings: indexSettings,
      mappings: {
        properties: hostHealthFieldMappings,
      },
    },
  },
  detectorConfig: {
    name: hostHealthDetectorName,
    description:
      'A sample detector to detect anomalies with logs related to the health of a host.',
    time_field: 'timestamp',
    indices: [hostHealthIndexName],
    featureAttributes: [
      {
        feature_name: 'max_cpu_usage',
        feature_enabled: true,
        importance: 1,
        aggregationQuery: {
          sum_cpu_usage: { max: { field: 'cpu_usage_percentage' } },
        },
      },
      {
        feature_name: 'max_memory_usage',
        feature_enabled: true,
        importance: 2,
        aggregationQuery: {
          sum_memory_usage: { max: { field: 'memory_usage_percentage' } },
        },
      },
      {
        feature_name: 'avg_cpu_usage',
        feature_enabled: true,
        importance: 3,
        aggregationQuery: {
          avg_cpu_usage: { avg: { field: 'cpu_usage_percentage' } },
        },
      },
      {
        feature_name: 'avg_memory_usage',
        feature_enabled: true,
        importance: 4,
        aggregationQuery: {
          avg_memory_usage: { avg: { field: 'memory_usage_percentage' } },
        },
      },
    ],
    uiMetadata: {
      features: {
        max_cpu_usage: {
          featureType: 'simple_aggs',
          aggregationBy: 'max',
          aggregationOf: 'cpu_usage_percentage',
        },
        max_memory_usage: {
          featureType: 'simple_aggs',
          aggregationBy: 'max',
          aggregationOf: 'memory_usage_percentage',
        },
        avg_cpu_usage: {
          featureType: 'simple_aggs',
          aggregationBy: 'avg',
          aggregationOf: 'cpu_usage_percentage',
        },
        avg_memory_usage: {
          featureType: 'simple_aggs',
          aggregationBy: 'avg',
          aggregationOf: 'memory_usage_percentage',
        },
      },
      filters: [],
    },
    detection_interval: {
      period: {
        interval: 10,
        unit: 'Minutes',
      },
    },
    window_delay: {
      period: {
        interval: 1,
        unit: 'Minutes',
      },
    },
  },
} as SAMPLE_DATA;
