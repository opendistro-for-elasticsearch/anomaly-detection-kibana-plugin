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

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { DurationInputArg2 } from 'moment';
import moment from 'moment';
import { PlotData, restyle, deleteTraces, addTraces } from 'plotly.js';
import Plot from 'react-plotly.js';
import { get, isEmpty } from 'lodash';
import dateMath from '@elastic/datemath';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiIcon,
  EuiLoadingChart,
  EuiStat,
  EuiSuperDatePicker,
  EuiText,
} from '@elastic/eui';
import {
  Chart,
  Axis,
  LineSeries,
  niceTimeFormatter,
  Settings,
  Position,
  LineAnnotation,
  AnnotationDomainTypes,
  RectAnnotation,
  ScaleType,
  XYBrushArea,
} from '@elastic/charts';
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  AnomalySummary,
  Monitor,
  Detector,
  DateRange,
  MonitorAlert,
} from '../../../models/interfaces';
import {
  prepareDataForChart,
  filterWithDateRange,
  filterWithHeatmapFilter,
} from '../../utils/anomalyResultUtils';
import { AlertsFlyout } from '../components/AlertsFlyout/AlertsFlyout';

import { AlertsButton } from '../components/AlertsButton/AlertsButton';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import {
  AlertsStat,
  AnomalyStatWithTooltip,
} from '../components/AnomaliesStat/AnomalyStat';
import {
  INITIAL_ANOMALY_SUMMARY,
  CHART_FIELDS,
  DATE_PICKER_QUICK_OPTIONS,
  ANOMALY_CHART_THEME,
} from '../utils/constants';
import {
  convertAlerts,
  generateAlertAnnotations,
  getAnomalySummary,
  disabledHistoryAnnotations,
  getAlertsQuery,
} from '../utils/anomalyChartUtils';
import { searchES } from '../../../redux/reducers/elasticsearch';
import { AnomalyDetailsChart } from '../containers/AnomalyDetailsChart';
import {
  AnomalyHeatmapChart,
  HeatmapCell,
} from '../containers/AnomalyHeatmapChart';

interface AnomaliesChartProps {
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
  onViewEntitiesSelected?(viewEntities: string[]): void;
}

export const AnomaliesChart = React.memo((props: AnomaliesChartProps) => {
  const [datePickerRange, setDatePickerRange] = useState({
    start: 'now-7d',
    end: 'now',
  });

  const [selectedAnomalies, setSelectedAnomalies] = useState<any[]>([]);
  const [selectedAnomalySummary, setSelectedAnomalySummary] = useState<
    AnomalySummary
  >(INITIAL_ANOMALY_SUMMARY);

  const handleZoomRangeChange = (start: number, end: number) => {
    props.onZoomRangeChange(start, end);
  };

  useEffect(() => {
    if (props.selectedHeatmapCell) {
      const resultAnomalies = filterWithHeatmapFilter(
        props.anomalies,
        props.selectedHeatmapCell
      );
      setSelectedAnomalies(resultAnomalies);
      const resultAnomalySummary = getAnomalySummary(resultAnomalies);
      setSelectedAnomalySummary(resultAnomalySummary);
    }
  }, [props.selectedHeatmapCell]);

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
                    <AnomalyHeatmapChart
                      detectorId={props.detectorId}
                      detectorName={props.detectorName}
                      dateRange={props.dateRange}
                      //@ts-ignore
                      title={props.detectorCategoryField[0]}
                      anomalies={props.anomalies}
                      isLoading={props.isLoading}
                      showAlerts={props.showAlerts}
                      monitor={props.monitor}
                      detectorInterval={props.detectorInterval}
                      unit={props.unit}
                      onHeatmapCellSelected={props.onHeatmapCellSelected}
                      onViewEntitiesSelected={props.onViewEntitiesSelected}
                    />
                  )}
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : (
            <AnomalyDetailsChart
              dateRange={props.dateRange}
              onDateRangeChange={handleDateRangeChange}
              onZoomRangeChange={props.onZoomRangeChange}
              anomalies={props.anomalies}
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
