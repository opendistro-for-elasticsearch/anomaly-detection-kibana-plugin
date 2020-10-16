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

import dateMath from '@elastic/datemath';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingChart,
  EuiSpacer,
  EuiSuperDatePicker,
} from '@elastic/eui';
import { get } from 'lodash';
import moment, { DurationInputArg2 } from 'moment';
import React, { useState } from 'react';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import {
  Anomalies,
  DateRange,
  Detector,
  Monitor,
} from '../../../models/interfaces';
import { generateAnomalyAnnotations } from '../../utils/anomalyResultUtils';
import { AlertsButton } from '../components/AlertsButton/AlertsButton';
import { AnomalyDetailsChart } from '../containers/AnomalyDetailsChart';
import {
  AnomalyHeatmapChart,
  HeatmapCell,
} from '../containers/AnomalyHeatmapChart';
import {
  DATE_PICKER_QUICK_OPTIONS,
  INITIAL_ANOMALY_SUMMARY,
} from '../utils/constants';
import { AnomalyOccurrenceChart } from './AnomalyOccurrenceChart';
import { FeatureBreakDown } from './FeatureBreakDown';

interface AnomaliesChartProps {
  onDateRangeChange(
    startDate: number,
    endDate: number,
    dateRangeOption?: string
  ): void;
  onZoomRangeChange(startDate: number, endDate: number): void;
  title: string;
  bucketizedAnomalies: boolean;
  anomalySummary: any;
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
  children: React.ReactNode | React.ReactNode[];
  isHCDetector?: boolean;
  detectorCategoryField?: string[];
  onHeatmapCellSelected?(heatmapCell: HeatmapCell): void;
  selectedHeatmapCell?: HeatmapCell;
  newDetector?: Detector;
  zoomRange?: DateRange;
  anomaliesResult: Anomalies | undefined;
}

export const AnomaliesChart = React.memo((props: AnomaliesChartProps) => {
  const [datePickerRange, setDatePickerRange] = useState({
    start: 'now-7d',
    end: 'now',
  });

  const anomalies = get(props.anomaliesResult, 'anomalies', []);

  const handleDateRangeChange = (startDate: number, endDate: number) => {
    props.onDateRangeChange(startDate, endDate);
    props.onZoomRangeChange(startDate, endDate);
  };

  const showLoader = useDelayedLoader(props.isLoading);

  const handleDatePickerDateRangeChange = (
    start: string,
    end: string,
    refresh?: boolean
  ) => {
    if (start && end) {
      const startTime: moment.Moment | undefined = dateMath.parse(start);
      if (startTime) {
        const endTime: moment.Moment | undefined =
          start === end && start.startsWith('now/')
            ? moment(startTime)
                .add(1, start.slice(start.length - 1) as DurationInputArg2)
                .subtract(1, 'milliseconds')
            : dateMath.parse(end);
        if (endTime) {
          if (
            !refresh &&
            !props.bucketizedAnomalies &&
            startTime.valueOf() >= props.dateRange.startDate &&
            endTime.valueOf() <= props.dateRange.endDate
          ) {
            props.onZoomRangeChange(startTime.valueOf(), endTime.valueOf());
          } else {
            handleDateRangeChange(startTime.valueOf(), endTime.valueOf());
          }
        }
      }
    }
  };

  const handleDatePickerRangeChange = (start: number, end: number) => {
    setDatePickerRange({
      start: moment(start).format(),
      end: moment(end).format(),
    });
  };

  const datePicker = () => (
    <EuiSuperDatePicker
      isLoading={props.isLoading}
      start={datePickerRange.start}
      end={datePickerRange.end}
      onTimeChange={({ start, end, isInvalid, isQuickSelection }) => {
        setDatePickerRange({ start: start, end: end });
        handleDatePickerDateRangeChange(start, end);
      }}
      onRefresh={({ start, end, refreshInterval }) => {
        handleDatePickerDateRangeChange(start, end, true);
      }}
      isPaused={true}
      commonlyUsedRanges={DATE_PICKER_QUICK_OPTIONS}
    />
  );

  const setUpAlertsButton = () => (
    <AlertsButton
      monitor={props.monitor}
      detectorId={props.detectorId}
      detectorName={props.detectorName}
      detectorInterval={get(props, 'detectorInterval', 1)}
      unit={get(props, 'unit', 'Minutes')}
    />
  );

  const alertsActionsWithDatePicker = () => {
    return (
      <EuiFlexGroup>
        <EuiFlexItem style={{ marginRight: '8px' }}>{datePicker()}</EuiFlexItem>

        <EuiFlexItem style={{ marginLeft: '0px' }}>
          {setUpAlertsButton()}
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  return (
    <React.Fragment>
      <ContentPanel
        title={props.title}
        actions={
          props.showAlerts ? alertsActionsWithDatePicker() : datePicker()
        }
      >
        <EuiFlexGroup direction="column">
          {props.isHCDetector &&
          props.onHeatmapCellSelected &&
          props.detectorCategoryField ? (
            <EuiFlexGroup style={{ padding: '20px' }}>
              <EuiFlexItem style={{ margin: '0px' }}>
                <div
                  style={{
                    width: '100%',
                    opacity: showLoader ? 0.2 : 1,
                  }}
                >
                  {props.isLoading ? (
                    <EuiFlexGroup
                      justifyContent="spaceAround"
                      style={{ paddingTop: '150px' }}
                    >
                      <EuiFlexItem grow={false}>
                        <EuiLoadingChart size="xl" mono />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  ) : (
                    [
                      <AnomalyHeatmapChart
                        detectorId={props.detectorId}
                        detectorName={props.detectorName}
                        dateRange={props.dateRange}
                        //@ts-ignore
                        title={props.detectorCategoryField[0]}
                        anomalies={anomalies}
                        isLoading={props.isLoading}
                        showAlerts={props.showAlerts}
                        monitor={props.monitor}
                        detectorInterval={props.detectorInterval}
                        unit={props.unit}
                        onHeatmapCellSelected={props.onHeatmapCellSelected}
                      />,
                      props.showAlerts === undefined || !props.showAlerts
                        ? [
                            <EuiSpacer size="m" />,
                            <AnomalyOccurrenceChart
                              title={
                                props.selectedHeatmapCell
                                  ? props.selectedHeatmapCell.entityValue
                                  : '-'
                              }
                              dateRange={props.dateRange}
                              onDateRangeChange={props.onDateRangeChange}
                              onZoomRangeChange={props.onZoomRangeChange}
                              anomalies={anomalies}
                              bucketizedAnomalies={false}
                              anomalySummary={INITIAL_ANOMALY_SUMMARY}
                              isLoading={props.isLoading}
                              anomalyGradeSeriesName="Anomaly grade"
                              confidenceSeriesName="Confidence"
                              showAlerts={false}
                              detectorId={props.detectorId}
                              detectorName={props.detectorName}
                              detector={props.detector}
                              detectorInterval={get(
                                props.detector,
                                'detectionInterval.period.interval'
                              )}
                              unit={get(
                                props.detector,
                                'detectionInterval.period.unit'
                              )}
                              isHCDetector={props.isHCDetector}
                              selectedHeatmapCell={props.selectedHeatmapCell}
                            />,
                            <EuiSpacer size="m" />,
                            <FeatureBreakDown
                              title="Sample feature breakdown"
                              //@ts-ignore
                              detector={props.newDetector}
                              //@ts-ignore
                              anomaliesResult={props.anomaliesResult}
                              annotations={generateAnomalyAnnotations(
                                get(props.anomaliesResult, 'anomalies', [])
                              )}
                              isLoading={props.isLoading}
                              //@ts-ignore
                              dateRange={props.zoomRange}
                              featureDataSeriesName="Sample feature output"
                              isHCDetector={props.isHCDetector}
                              selectedHeatmapCell={props.selectedHeatmapCell}
                            />,
                          ]
                        : null,
                    ]
                  )}
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : (
            <AnomalyDetailsChart
              dateRange={props.dateRange}
              onDateRangeChange={handleDateRangeChange}
              onZoomRangeChange={props.onZoomRangeChange}
              anomalies={anomalies}
              bucketizedAnomalies={props.bucketizedAnomalies}
              anomalySummary={props.anomalySummary}
              isLoading={props.isLoading}
              anomalyGradeSeriesName="Anomaly grade"
              confidenceSeriesName="Confidence"
              showAlerts={props.showAlerts}
              detectorId={props.detectorId}
              detectorName={props.detectorName}
              detector={props.detector}
              detectorInterval={get(
                props.detector,
                'detectionInterval.period.interval'
              )}
              unit={get(props.detector, 'detectionInterval.period.unit')}
              monitor={props.monitor}
              isHCDetector={props.isHCDetector}
              onDatePickerRangeChange={handleDatePickerRangeChange}
            />
          )}
        </EuiFlexGroup>
        <div style={{ paddingTop: '10px', margin: '0px -20px -30px -20px' }}>
          {props.children}
        </div>
      </ContentPanel>
    </React.Fragment>
  );
});
