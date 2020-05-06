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
import { get } from 'lodash';
import dateMath from '@elastic/datemath';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiIcon,
  EuiLoadingChart,
  EuiStat,
  EuiSuperDatePicker,
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
  children: React.ReactNode | React.ReactNode[];
}
export const AnomaliesChart = React.memo((props: AnomaliesChartProps) => {
  const dispatch = useDispatch();
  const [anomalySummary, setAnomalySummary] = useState<AnomalySummary>(
    INITIAL_ANOMALY_SUMMARY
  );
  const [showAlertsFlyout, setShowAlertsFlyout] = useState<boolean>(false);
  const [alertAnnotations, setAlertAnnotations] = useState<any[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(false);
  const [totalAlerts, setTotalAlerts] = useState<number | undefined>(undefined);
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [zoomRange, setZoomRange] = useState<DateRange>({
    ...props.dateRange,
  });
  const [zoomedAnomalies, setZoomedAnomalies] = useState<any[]>([]);

  const [datePickerRange, setDatePickerRange] = useState({
    start: 'now-7d',
    end: 'now',
  });

  useEffect(() => {
    const anomalies = prepareDataForChart(props.anomalies, zoomRange);
    setZoomedAnomalies(anomalies);
    setAnomalySummary(
      !props.bucketizedAnomalies
        ? getAnomalySummary(
            filterWithDateRange(props.anomalies, zoomRange, 'plotTime')
          )
        : props.anomalySummary
    );
    setTotalAlerts(filterWithDateRange(alerts, zoomRange, 'startTime').length);
  }, [props.anomalies, zoomRange]);

  const handleZoomRangeChange = (start: number, end: number) => {
    setZoomRange({
      startDate: start,
      endDate: end,
    });
    props.onZoomRangeChange(start, end);
  };

  useEffect(() => {
    async function getMonitorAlerts(monitorId: string, startDateTime: number) {
      try {
        setIsLoadingAlerts(true);
        const result = await dispatch(
          searchES(getAlertsQuery(monitorId, startDateTime))
        );
        setIsLoadingAlerts(false);
        setTotalAlerts(
          get(result, 'data.response.aggregations.total_alerts.value')
        );
        const monitorAlerts = convertAlerts(result);
        setAlerts(monitorAlerts);
        const annotations = generateAlertAnnotations(monitorAlerts);
        setAlertAnnotations(annotations);
      } catch (err) {
        console.error(`Failed to get alerts for monitor ${monitorId}`, err);
        setIsLoadingAlerts(false);
      }
    }
    if (props.monitor && props.dateRange.startDate) {
      getMonitorAlerts(props.monitor.id, props.dateRange.startDate);
    }
  }, [props.monitor, props.dateRange.startDate]);

  const anomalyChartTimeFormatter = niceTimeFormatter([
    zoomRange.startDate,
    zoomRange.endDate,
  ]);

  const handleDateRangeChange = (startDate: number, endDate: number) => {
    props.onDateRangeChange(startDate, endDate);
    handleZoomRangeChange(startDate, endDate);
  };

  const showLoader = useDelayedLoader(props.isLoading || isLoadingAlerts);

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
            handleZoomRangeChange(startTime.valueOf(), endTime.valueOf());
          } else {
            handleDateRangeChange(startTime.valueOf(), endTime.valueOf());
          }
        }
      }
    }
  };

  const datePicker = () => (
    <EuiSuperDatePicker
      isLoading={props.isLoading || isLoadingAlerts}
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
          <EuiFlexGroup style={{ padding: '20px' }}>
            <EuiFlexItem>
              <EuiStat
                title={
                  props.isLoading || isLoadingAlerts
                    ? '-'
                    : anomalySummary.anomalyOccurrence
                }
                description={
                  props.showAlerts
                    ? 'Anomaly occurrences'
                    : 'Sample anomaly occurrences'
                }
                titleSize="s"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <AnomalyStatWithTooltip
                isLoading={props.isLoading || isLoadingAlerts}
                minValue={anomalySummary.minAnomalyGrade}
                maxValue={anomalySummary.maxAnomalyGrade}
                description={
                  props.showAlerts ? 'Anomaly grade' : 'Sample anomaly grade'
                }
                tooltip="Indicates to what extent this data point is anomalous."
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <AnomalyStatWithTooltip
                isLoading={props.isLoading || isLoadingAlerts}
                minValue={anomalySummary.minConfidence}
                maxValue={anomalySummary.maxConfidence}
                description={
                  props.showAlerts ? 'Confidence' : 'Sample confidence'
                }
                tooltip="Indicates the level of confidence in the anomaly result."
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                title={
                  props.isLoading || isLoadingAlerts
                    ? ''
                    : anomalySummary.lastAnomalyOccurrence
                }
                description={
                  props.showAlerts
                    ? 'Last anomaly occurrence'
                    : 'Last sample anomaly occurrence'
                }
                titleSize="s"
              />
            </EuiFlexItem>
            {props.showAlerts ? (
              <EuiFlexItem>
                <AlertsStat
                  monitor={props.monitor}
                  showAlertsFlyout={() => setShowAlertsFlyout(true)}
                  totalAlerts={totalAlerts}
                  isLoading={props.isLoading}
                />
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem grow={true}>
              <div
                style={{
                  height: '200px',
                  width: '100%',
                  opacity: showLoader ? 0.2 : 1,
                }}
              >
                {props.isLoading || isLoadingAlerts ? (
                  <EuiFlexGroup
                    justifyContent="spaceAround"
                    style={{ paddingTop: '150px' }}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiLoadingChart size="xl" mono />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                ) : (
                  <Chart>
                    <Settings
                      showLegend
                      showLegendExtra={false}
                      //TODO: research more why only set this old property will work.
                      showLegendDisplayValue={false}
                      legendPosition={Position.Right}
                      onBrushEnd={(start: number, end: number) => {
                        !props.bucketizedAnomalies
                          ? handleZoomRangeChange(start, end)
                          : handleDateRangeChange(start, end);
                        setDatePickerRange({
                          start: moment(start).format(),
                          end: moment(end).format(),
                        });
                      }}
                      theme={ANOMALY_CHART_THEME}
                    />
                    <RectAnnotation
                      dataValues={disabledHistoryAnnotations(
                        props.dateRange,
                        props.detector
                      )}
                      id="anomalyAnnotations"
                      style={{
                        stroke: darkModeEnabled() ? 'red' : '#D5DBDB',
                        strokeWidth: 1,
                        opacity: 0.8,
                        fill: darkModeEnabled() ? 'red' : '#D5DBDB',
                      }}
                    />
                    {alertAnnotations ? (
                      <LineAnnotation
                        id="alertAnnotation"
                        domainType={AnnotationDomainTypes.XDomain}
                        dataValues={alertAnnotations}
                        marker={<EuiIcon type="bell" />}
                      />
                    ) : null}
                    <Axis
                      id="bottom"
                      position="bottom"
                      tickFormat={anomalyChartTimeFormatter}
                    />
                    <Axis
                      id="left"
                      title={'Anomaly grade / confidence'}
                      position="left"
                      domain={{ min: 0, max: 1 }}
                      showGridLines
                    />
                    <LineSeries
                      id="confidence"
                      name={props.confidenceSeriesName}
                      xScaleType={ScaleType.Time}
                      yScaleType={ScaleType.Linear}
                      xAccessor={CHART_FIELDS.PLOT_TIME}
                      yAccessors={[CHART_FIELDS.CONFIDENCE]}
                      data={zoomedAnomalies}
                    />
                    <LineSeries
                      id="anomalyGrade"
                      name={props.anomalyGradeSeriesName}
                      data={zoomedAnomalies}
                      xScaleType={ScaleType.Time}
                      yScaleType={ScaleType.Linear}
                      xAccessor={CHART_FIELDS.PLOT_TIME}
                      yAccessors={[CHART_FIELDS.ANOMALY_GRADE]}
                    />
                  </Chart>
                )}
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
        <div style={{ paddingTop: '10px', margin: '0px -20px -30px -20px' }}>
          {props.children}
        </div>
      </ContentPanel>

      {showAlertsFlyout ? (
        <AlertsFlyout
          // @ts-ignore
          detectorId={props.detectorId}
          // @ts-ignore
          detectorName={props.detectorName}
          detectorInterval={get(props, 'detectorInterval', 1)}
          unit={get(props, 'unit', 'Minutes')}
          monitor={props.monitor}
          onClose={() => setShowAlertsFlyout(false)}
        />
      ) : null}
    </React.Fragment>
  );
});
