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
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { Monitor, Detector, DateRange } from '../../../models/interfaces';
import { AnomalyDetailsChart } from './AnomalyDetailsChart';
import { HeatmapCell } from './AnomalyHeatmapChart';
import { filterWithHeatmapFilter } from '../../utils/anomalyResultUtils';
import {
  getAnomalySummary,
  getDateRangeWithSelectedHeatmapCell,
} from '../utils/anomalyChartUtils';

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
  dateRange: DateRange;
  isLoading: boolean;
  showAlerts?: boolean;
  isNotSample?: boolean;
  anomalyGradeSeriesName: string;
  confidenceSeriesName: string;
  detector: Detector;
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

    return (
      <ContentPanel title={props.title}>
        <AnomalyDetailsChart
          dateRange={getDateRangeWithSelectedHeatmapCell(
            props.dateRange,
            props.isHCDetector,
            props.selectedHeatmapCell
          )}
          onDateRangeChange={props.onDateRangeChange}
          onZoomRangeChange={props.onZoomRangeChange}
          anomalies={getAnomaliesForChart()}
          bucketizedAnomalies={props.bucketizedAnomalies}
          anomalySummary={getAnomalySummaryForChart()}
          isLoading={props.isLoading}
          anomalyGradeSeriesName={props.anomalyGradeSeriesName}
          confidenceSeriesName={props.confidenceSeriesName}
          showAlerts={props.showAlerts}
          isNotSample={props.isNotSample}
          detector={props.detector}
          monitor={props.monitor}
          isHCDetector={props.isHCDetector}
          selectedHeatmapCell={props.selectedHeatmapCell}
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
