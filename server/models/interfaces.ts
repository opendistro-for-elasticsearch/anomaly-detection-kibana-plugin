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

export interface DefaultHeaders {
  'Content-Type': 'application/json';
  Accept: 'application/json';
  'User-Agent': 'Kibana';
}

export interface SearchResponse<T> {
  hits: {
    total: { value: number };
    hits: {
      _source: T;
      _id: string;
      _seq_no?: number;
      _primary_term?: number;
    }[];
  };
}

export interface ADApis {
  [API_ROUTE: string]: string;
  readonly DETECTOR_BASE: string;
}

export interface AlertingApis {
  [API_ROUTE: string]: string;
  readonly ALERTING_BASE: string;
}

export type Anomaly = {
  anomalyGrade: number;
  confidence: number;
  anomalyScore: number;
  startTime: number;
  endTime: number;
  plotTime: number;
};
//Plot time is middle of start and end time to provide better visualization to customers
// Example, if window is 10 mins, in a given startTime and endTime of 12:10 to 12:20 respectively.
// plotTime will be 12:15.
export type FeatureData = {
  startTime: number;
  endTime: number;
  plotTime: number;
  data: number;
};
export interface AnomalyResults {
  anomalies: Anomaly[];
  featureData: { [key: string]: FeatureData[] };
}
