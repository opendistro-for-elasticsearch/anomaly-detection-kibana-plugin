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

import { get } from 'lodash';
import {
  DateRange,
  Detector,
  MonitorAlert,
  AnomalySummary,
} from '../../../models/interfaces';
import { dateFormatter, minuteDateFormatter } from '../../utils/helpers';
import { RectAnnotationDatum } from '@elastic/charts';
import { DEFAULT_ANOMALY_SUMMARY } from './constants';

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
  const anomalies = totalAnomalies.filter(anomaly => anomaly.anomalyGrade > 0);
  const maxConfidence = Math.max(
    ...anomalies.map(anomaly => anomaly.confidence),
    0.0
  );
  const minConfidence = Math.min(
    ...anomalies.map(anomaly => anomaly.confidence),
    1.0
  );

  const maxAnomalyGrade = Math.max(
    ...anomalies.map(anomaly => anomaly.anomalyGrade),
    0.0
  );
  const minAnomalyGrade = Math.min(
    ...anomalies.map(anomaly => anomaly.anomalyGrade),
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
  if (!detector || !detector.disabledTime) {
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
