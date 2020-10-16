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

import {
  AnnotationDomainTypes,
  Axis,
  Chart,
  LineAnnotation,
  LineSeries,
  niceTimeFormatter,
  Position,
  RectAnnotation,
  ScaleType,
  Settings,
  XYBrushArea,
} from '@elastic/charts';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingChart,
  EuiStat,
} from '@elastic/eui';
import { get } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import {
  AnomalySummary,
  DateRange,
  Detector,
  Monitor,
  MonitorAlert,
} from '../../../models/interfaces';
import { searchAlerts } from '../../../redux/reducers/alerting';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import {
  filterWithDateRange,
  prepareDataForChart,
} from '../../utils/anomalyResultUtils';
import { AlertsFlyout } from '../components/AlertsFlyout/AlertsFlyout';
import {
  AlertsStat,
  AnomalyStatWithTooltip,
} from '../components/AnomaliesStat/AnomalyStat';
import {
  convertAlerts,
  disabledHistoryAnnotations,
  generateAlertAnnotations,
  getAnomalySummary,
} from '../utils/anomalyChartUtils';
import {
  ANOMALY_CHART_THEME,
  CHART_FIELDS,
  INITIAL_ANOMALY_SUMMARY,
} from '../utils/constants';
import { HeatmapCell } from './AnomalyHeatmapChart';

interface AnomalyDetailsChartProps {
  onDateRangeChange(
    startDate: number,
    endDate: number,
    dateRangeOption?: string
  ): void;
  onZoomRangeChange(startDate: number, endDate: number): void;
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
  isHCDetector?: boolean;
  selectedHeatmapCell?: HeatmapCell;
  onDatePickerRangeChange?(startDate: number, endDate: number): void;
}

export const AnomalyDetailsChart = React.memo(
  (props: AnomalyDetailsChartProps) => {
    const dispatch = useDispatch();
    const [anomalySummary, setAnomalySummary] = useState<AnomalySummary>(
      INITIAL_ANOMALY_SUMMARY
    );
    const [showAlertsFlyout, setShowAlertsFlyout] = useState<boolean>(false);
    const [alertAnnotations, setAlertAnnotations] = useState<any[]>([]);
    const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(false);
    const [totalAlerts, setTotalAlerts] = useState<number | undefined>(
      undefined
    );
    const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
    const [zoomRange, setZoomRange] = useState<DateRange>({
      ...props.dateRange,
    });
    const [zoomedAnomalies, setZoomedAnomalies] = useState<any[]>([]);

    const DEFAULT_DATE_PICKER_RANGE = {
      start: moment().subtract(7, 'days').valueOf(),
      end: moment().valueOf(),
    };

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
      setTotalAlerts(
        filterWithDateRange(alerts, zoomRange, 'startTime').length
      );
    }, [props.anomalies, zoomRange, props.dateRange]);

    useEffect(() => {
      setZoomRange(props.dateRange);
    }, [props.dateRange]);

    const handleZoomRangeChange = (start: number, end: number) => {
      setZoomRange({
        startDate: start,
        endDate: end,
      });
      props.onZoomRangeChange(start, end);
    };

    useEffect(() => {
      async function getMonitorAlerts(
        monitorId: string,
        startDateTime: number,
        endDateTime: number
      ) {
        try {
          setIsLoadingAlerts(true);
          const result = await dispatch(
            searchAlerts(monitorId, startDateTime, endDateTime)
          );
          setIsLoadingAlerts(false);
          setTotalAlerts(get(result, 'data.response.totalAlerts'));
          const monitorAlerts = convertAlerts(result);
          setAlerts(monitorAlerts);
          const annotations = generateAlertAnnotations(monitorAlerts);
          setAlertAnnotations(annotations);
        } catch (err) {
          console.error(`Failed to get alerts for monitor ${monitorId}`, err);
          setIsLoadingAlerts(false);
        }
      }
      if (
        props.monitor &&
        props.dateRange.startDate &&
        // only load alert stats for non HC detector
        props.isHCDetector != undefined &&
        !props.isHCDetector
      ) {
        getMonitorAlerts(
          props.monitor.id,
          props.dateRange.startDate,
          props.dateRange.endDate
        );
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

    return (
      <React.Fragment>
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
              tooltip="Indicates to what extent this data point is anomalous. The scale ranges from 0 to 1."
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
          {props.showAlerts && !props.isHCDetector ? (
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
                    onBrushEnd={
                      props.isHCDetector
                        ? undefined
                        : (brushArea: XYBrushArea) => {
                            const start = get(
                              brushArea,
                              'x.0',
                              DEFAULT_DATE_PICKER_RANGE.start
                            );
                            const end = get(
                              brushArea,
                              'x.1',
                              DEFAULT_DATE_PICKER_RANGE.start
                            );
                            !props.bucketizedAnomalies
                              ? handleZoomRangeChange(start, end)
                              : handleDateRangeChange(start, end);
                            if (props.onDatePickerRangeChange) {
                              props.onDatePickerRangeChange(start, end);
                            }
                          }
                    }
                    theme={ANOMALY_CHART_THEME}
                  />
                  {props.isHCDetector && !props.selectedHeatmapCell ? null : (
                    <RectAnnotation
                      dataValues={disabledHistoryAnnotations(
                        zoomRange,
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
                  )}

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
  }
);
