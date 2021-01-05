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
import { getAnomalySummary } from '../anomalyChartUtils';

describe('anomalyChartUtils', () => {
  describe('getAnomalySummary', () => {
    test('test anomaly summary happy case', () => {
      const anomalySummary = getAnomalySummary([
        {
          anomalyGrade: 0.7,
          confidence: 0.87,
          endTime: 1589313164793,
          plotTime: 1589313164793,
          startTime: 1589313044793,
        },
        {
          anomalyGrade: 0.1,
          confidence: 0.98,
          endTime: 1589258804798,
          plotTime: 1589258804798,
          startTime: 1589258684798,
        },
        {
          anomalyGrade: 0.4,
          confidence: 0.86,
          endTime: 1589258684789,
          plotTime: 1589258684789,
          startTime: 1589258564789,
        },
      ]);

      expect(anomalySummary).toEqual({
        anomalyOccurrence: 3,
        minAnomalyGrade: 0.1,
        maxAnomalyGrade: 0.7,
        avgAnomalyGrade: 0.4,
        minConfidence: 0.86,
        maxConfidence: 0.98,
        lastAnomalyOccurrence: moment(1589313164793).format('MM/DD/YY hh:mm A'),
      });
    });
    test('test anomaly summary with empty anomalies', () => {
      const anomalySummary = getAnomalySummary([]);

      expect(anomalySummary).toEqual({
        anomalyOccurrence: 0,
        minAnomalyGrade: 0,
        maxAnomalyGrade: 0,
        minConfidence: 0,
        maxConfidence: 0,
        lastAnomalyOccurrence: '-',
      });
    });
    test('test anomaly summary with undefined anomalies', () => {
      const anomalySummary = getAnomalySummary(undefined);
      expect(anomalySummary).toEqual({
        anomalyOccurrence: 0,
        minAnomalyGrade: 0,
        maxAnomalyGrade: 0,
        minConfidence: 0,
        maxConfidence: 0,
        lastAnomalyOccurrence: '-',
      });
    });
  });
});
