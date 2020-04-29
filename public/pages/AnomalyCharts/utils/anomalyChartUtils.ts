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

export const getAlertsQuery = (monitorId: string, startTime: number) => {
  return {
    index: '.opendistro-alerting-alert*',
    size: 1000,
    rawQuery: {
      aggregations: {
        total_alerts: {
          value_count: {
            field: 'monitor_id',
          },
        },
      },
      query: {
        bool: {
          filter: [
            {
              term: {
                monitor_id: monitorId,
              },
            },
            {
              range: {
                start_time: {
                  gte: startTime,
                  format: 'epoch_millis',
                },
              },
            },
          ],
        },
      },
      sort: [{ start_time: { order: 'desc' } }],
    },
  };
};

export const convertAlerts = (response: any): MonitorAlert[] => {
  const hits = get(response, 'data.response.hits.hits', []);
  return hits.map((alert: any) => {
    return {
      monitorName: get(alert, '_source.monitor_name'),
      triggerName: get(alert, '_source.trigger_name'),
      severity: get(alert, '_source.severity'),
      state: get(alert, '_source.state'),
      error: get(alert, '_source.error_message'),
      startTime: get(alert, '_source.start_time'),
      endTime: get(alert, '_source.end_time'),
      acknowledgedTime: get(alert, '_source.acknowledged_time'),
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
  let latestAnomaly = anomalies[0];
  for (let i = 1, len = anomalies.length; i < len; i++) {
    let item = anomalies[i];
    latestAnomaly =
      item.startTime > latestAnomaly.startTime ? item : latestAnomaly;
  }
  return latestAnomaly;
};

export const getAnomalySummary = (anomalies: any[]): AnomalySummary => {
  let minConfidence = 1.0,
    maxConfidence = 0.0;
  let minAnomalyGrade = 1.0,
    maxAnomalyGrade = 0.0;
  const targetAnomalies = anomalies.filter(anomaly => {
    if (anomaly.anomalyGrade < minAnomalyGrade) {
      minAnomalyGrade = anomaly.anomalyGrade;
    }
    if (anomaly.anomalyGrade > maxAnomalyGrade) {
      maxAnomalyGrade = anomaly.anomalyGrade;
    }
    if (anomaly.confidence < minConfidence) {
      minConfidence = anomaly.confidence;
    }
    if (anomaly.confidence > maxConfidence) {
      maxConfidence = anomaly.confidence;
    }
    if (anomaly.anomalyGrade > 0) {
      return true;
    }
  });

  const lastAnomalyOccurrence =
    targetAnomalies.length > 0
      ? minuteDateFormatter(findLatestAnomaly(targetAnomalies).endTime)
      : '-';

  return {
    anomalyOccurrence: targetAnomalies.length,
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
) => {
  if (!detector || detector.disabledTime) {
    return [];
  }
  const startTime = detector.disabledTime;
  const endTime = detector.enabled
    ? detector.enabledTime
    : dateRange.endDate.valueOf();

  if (startTime) {
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
  }
};
