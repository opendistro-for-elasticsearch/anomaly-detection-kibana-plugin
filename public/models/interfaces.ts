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

import { InitProgress } from '../../server/models/interfaces';
import { DATA_TYPES } from '../utils/constants';
import { DETECTOR_STATE } from '../../server/utils/constants';

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
  aggregationBy?: string;
  aggregationOf?: string;
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
  shingleSize: number;
  uiMetadata: UiMetaData;
  lastUpdateTime: number;
  enabled?: boolean;
  enabledTime?: number;
  disabledTime?: number;
  curState: DETECTOR_STATE;
  stateError: string;
  initProgress?: InitProgress;
  categoryField?: string[];
  detectionDateRange?: DetectionDateRange;
  taskId?: string;
  taskProgress?: number;
};

export type DetectorListItem = {
  id: string;
  name: string;
  indices: string[];
  curState: DETECTOR_STATE;
  featureAttributes: FeatureAttributes[];
  totalAnomalies: number;
  lastActiveAnomaly: number;
  lastUpdateTime: number;
  enabledTime?: number;
};

export type HistoricalDetectorListItem = {
  id: string;
  name: string;
  curState: DETECTOR_STATE;
  indices: string[];
  totalAnomalies: number;
  dataStartTime: number;
  dataEndTime: number;
};

export type EntityData = {
  name: string;
  value: string;
};

export type AnomalyData = {
  anomalyGrade: number;
  anomalyScore?: number;
  confidence: number;
  detectorId?: string;
  endTime: number;
  startTime: number;
  plotTime?: number;
  entity?: EntityData[];
  features?: { [key: string]: FeatureAggregationData };
};

export type FeatureAggregationData = {
  data: number;
  endTime: number;
  startTime: number;
  plotTime?: number;
};

export type Anomalies = {
  anomalies: AnomalyData[];
  featureData: { [key: string]: FeatureAggregationData[] };
};

export type Monitor = {
  id: string;
  name: string;
  enabled: boolean;
  enabledTime?: number;
  schedule: { period: Schedule };
  inputs: any[];
  triggers: any[];
  lastUpdateTime: number;
};

export type MonitorAlert = {
  monitorName: string;
  triggerName: string;
  severity: number;
  state: string;
  error: string;
  startTime: number;
  endTime: number;
  acknowledgedTime: number;
};

export type AnomalySummary = {
  anomalyOccurrence: number;
  minAnomalyGrade: number;
  maxAnomalyGrade: number;
  avgAnomalyGrade?: number;
  minConfidence: number;
  maxConfidence: number;
  lastAnomalyOccurrence: string;
};

export type DateRange = {
  startDate: number;
  endDate: number;
};

export type DetectionDateRange = {
  startTime: number;
  endTime: number;
};
