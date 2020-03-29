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

import { DATA_TYPES } from '../utils/constants';

export type FieldInfo = {
  label: string;
  type: DATA_TYPES;
};

export enum FILTER_TYPES {
  SIMPLE = 'simple_filter',
  CUSTOM = 'custom_filter',
}

export enum FEATURE_TYPE {
  SIMPLE = 'simple_aggs',
  CUSTOM = 'custom_aggs',
}

export enum OPERATORS_MAP {
  IS = 'is',
  IS_NOT = 'is_not',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
  IS_GREATER = 'is_greater',
  IS_GREATER_EQUAL = 'is_greater_equal',
  IS_LESS = 'is_less',
  IS_LESS_EQUAL = 'is_less_equal',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'does_not_contains',
  IN_RANGE = 'in_range',
  NOT_IN_RANGE = 'not_in_range',
}

export type UIFilter = {
  fieldInfo: FieldInfo[];
  operator: OPERATORS_MAP;
  fieldValue?: string | number | null;
  fieldRangeStart?: number;
  fieldRangeEnd?: number;
};

export type FeatureAttributes = {
  featureId?: string;
  featureName: string;
  featureEnabled: boolean;
  importance: number;
  aggregationQuery: { [key: string]: any };
};

export enum UNITS {
  MINUTES = 'MINUTES',
}

export type Schedule = {
  interval: number;
  unit: UNITS;
};

export type UiFeature = {
  featureType: FEATURE_TYPE;
  aggregationBy: string;
  aggregationOf: string;
};

export type UiMetaData = {
  filterType: FILTER_TYPES;
  filters: UIFilter[];
  features: {
    [key: string]: UiFeature;
  };
};
export type Detector = {
  primaryTerm: number;
  seqNo: number;
  id: string;
  name: string;
  description: string;
  timeField: string;
  indices: string[];
  filterQuery: { [key: string]: any };
  featureAttributes: FeatureAttributes[];
  windowDelay: { period: Schedule };
  detectionInterval: { period: Schedule };
  uiMetadata: UiMetaData;
  enabled?: boolean;
  enabledTime?: Date;
  disabledTime?: Date;
};

export type DetectorListItem = {
  id: string;
  name: string;
  totalAnomalies: number;
  lastActiveAnomaly: number;
};

export type AnomalyData = {
  anomalyGrade: number;
  anomalyScore: number;
  confidence: number;
  detectorId: string;
  endTime: number;
  startTime: number;
};

export type FeatureAggregationData = {
  data: number;
  endTime: number;
  startTime: number;
};

export type AnomalyPreview = {
  anomalies: AnomalyData[];
  featureData: { [key: string]: FeatureAggregationData[] };
};
