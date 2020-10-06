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

import React from 'react';
import { EuiBadge } from '@elastic/eui';
import { get } from 'lodash';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  AnomalySummary,
  Monitor,
  Detector,
  DateRange,
} from '../../../models/interfaces';
import { AnomalyDetailsChart } from './AnomalyDetailsChart';
import { HeatmapCell } from './AnomalyHeatmapChart';
import { filterWithHeatmapFilter } from '../../utils/anomalyResultUtils';
import { getAnomalySummary } from '../utils/anomalyChartUtils';

interface AnomalyOccurrenceChartProps {
  onDateRangeChange(
    startDate: number,
    endDate: number,
    dateRangeOption?: string
  ): void;
  onZoomRangeChange(startDate: number, endDate: number): void;
  title: string;
  anomalies: any[];
  bucketizedAnomalies: boolean;
  anomalySummary: any;
  annotations?: any[];
  dateRange: DateRange;
  isLoading: boolean;
  showAlerts?: boolean;
  anomalyGradeSeriesName: string;
  confidenceSeriesName: string;
  detectorId: string;
  detectorName: string;
  detector?: Detector;
  detectorInterval?: number;
  unit?: string;
  monitor?: Monitor;
  isHCDetector?: boolean;
  selectedHeatmapCell?: HeatmapCell;
}

export const AnomalyOccurrenceChart = React.memo(
  (props: AnomalyOccurrenceChartProps) => {
    const getAnomaliesForChart = () => {
      if (props.isHCDetector) {
        if (props.selectedHeatmapCell) {
          return filterWithHeatmapFilter(
            props.anomalies,
            props.selectedHeatmapCell
          );
        } else {
          return [];
        }
      } else {
        return props.anomalies;
      }
    };
    const getAnomalySummaryForChart = () => {
      console.log('Inside getAnomalySummaryForChart');
      if (props.isHCDetector) {
        if (props.selectedHeatmapCell) {
          return getAnomalySummary(
            filterWithHeatmapFilter(props.anomalies, props.selectedHeatmapCell)
          );
        } else {
          return [];
        }
      } else {
        return props.anomalySummary;
      }
    };

    const getDateRange = () => {
      console.log('Inside getDateRange');
      if (props.isHCDetector && props.selectedHeatmapCell) {
        return props.selectedHeatmapCell.dateRange;
      }
      return props.dateRange;
    };
    return (
      <ContentPanel title={props.title}>
        <AnomalyDetailsChart
          dateRange={getDateRange()}
          onDateRangeChange={props.onDateRangeChange}
          onZoomRangeChange={props.onZoomRangeChange}
          anomalies={getAnomaliesForChart()}
          bucketizedAnomalies={props.bucketizedAnomalies}
          anomalySummary={getAnomalySummaryForChart()}
          isLoading={props.isLoading}
          anomalyGradeSeriesName="Anomaly grade"
          confidenceSeriesName="Confidence"
          showAlerts={true}
          detectorId={props.detector ? props.detector.id : ''}
          detectorName={props.detector ? props.detector.name : ''}
          detector={props.detector}
          detectorInterval={get(
            props.detector,
            'detectionInterval.period.interval'
          )}
          unit={get(props.detector, 'detectionInterval.period.unit')}
          monitor={props.monitor}
          isHCDetector={props.isHCDetector}
        />
        {props.isHCDetector && props.selectedHeatmapCell === undefined ? (
          <EuiBadge className={'anomaly-detail-chart-center'} color={'default'}>
            {'Click on an anomaly entity to view data'}
          </EuiBadge>
        ) : null}
      </ContentPanel>
    );
  }
);
