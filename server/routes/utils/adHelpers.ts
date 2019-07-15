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

import { get, omit } from 'lodash';
import { AnomalyResults } from 'server/models/interfaces';
import { GetDetectorsQueryParams } from '../../models/types';
import { mapKeysDeep, toCamel, toSnake } from '../../utils/helpers';

export const convertDetectorKeysToSnakeCase = (payload: any) => {
  return {
    ...mapKeysDeep(
      {
        ...omit(payload, ['filterQuery', 'featureAttributes']), // Exclude the filterQuery,
      },
      toSnake
    ),
    filter_query: get(payload, 'filterQuery', {}),
    ui_metadata: get(payload, 'uiMetadata', {}),
    feature_attributes: get(payload, 'featureAttributes', []).map(
      (feature: any) => ({
        ...mapKeysDeep({ ...omit(feature, ['aggregationQuery']) }, toSnake),
        aggregation_query: feature.aggregationQuery,
      })
    ),
  };
};

export const convertDetectorKeysToCamelCase = (response: object) => {
  return {
    ...mapKeysDeep(
      omit(response, [
        'filter_query',
        'ui_metadata',
        'feature_query',
        'feature_attributes',
      ]),
      toCamel
    ),
    filterQuery: get(response, 'filter_query', {}),
    featureAttributes: get(response, 'feature_attributes', []).map(
      (feature: any) => ({
        ...mapKeysDeep({ ...omit(feature, ['aggregation_query']) }, toCamel),
        aggregationQuery: feature.aggregation_query,
      })
    ),
    uiMetadata: get(response, 'ui_metadata', {}),
  };
};

export const getResultAggregationQuery = (
  detectors: string[],
  queryParams: GetDetectorsQueryParams
) => {
  const aggregationSort = {
    totalAnomalies: 'total_anomalies_in_24hr',
    latestAnomalyTime: 'latest_anomaly_time',
  } as { [key: string]: string };

  let aggsSortingOrder = {};

  if (aggregationSort[queryParams.sortField]) {
    aggsSortingOrder = {
      order: {
        [aggregationSort[queryParams.sortField]]: queryParams.sortDirection,
      },
    };
  }
  return {
    size: 0,
    query: {
      bool: {
        must: {
          terms: {
            detector_id: detectors,
          },
        },
      },
    },
    aggs: {
      unique_detectors: {
        terms: {
          field: 'detector_id',
          size: queryParams.from + queryParams.size,
          ...aggsSortingOrder,
        },
        aggs: {
          total_anomalies_in_24hr: {
            filter: { range: { start_time: { gte: 'now-24h', lte: 'now' } } },
          },
          latest_anomaly_time: { max: { field: 'start_time' } },
        },
      },
    },
  };
};

export const anomalyResultMapper = (anomalyResults: any[]): AnomalyResults => {
  let resultData: AnomalyResults = {
    anomalies: [],
    featureData: {},
  };
  if (anomalyResults.length === 0) return resultData;
  //initialize features list.
  const firstAnomaly = anomalyResults[0];
  Object.values(firstAnomaly.featureData).forEach((feature: any) => {
    resultData.featureData[feature.featureId] = [];
  });
  anomalyResults.forEach(({ featureData, ...rest }) => {
    resultData.anomalies.push({
      ...rest,
      anomalyGrade:
        rest.anomalyGrade != null && rest.anomalyGrade > 0
          ? Number.parseFloat(rest.anomalyGrade).toFixed(3)
          : 0,
      confidence:
        rest.anomalyGrade != null && rest.anomalyGrade > 0
          ? Number.parseFloat(rest.confidence).toFixed(3)
          : 0,
      plotTime:
        rest.startTime + Math.floor((rest.endTime - rest.startTime) / 2),
    });
    featureData.forEach((feature: any) => {
      resultData.featureData[feature.featureId].push({
        startTime: rest.startTime,
        endTime: rest.endTime,
        plotTime:
          rest.startTime + Math.floor((rest.endTime - rest.startTime) / 2),
        data: feature.data,
      });
    });
  });
  return resultData;
};
