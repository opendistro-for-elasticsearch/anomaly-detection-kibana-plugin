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
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiSelect,
  EuiIcon,
  EuiLoadingChart,
  EuiStat,
} from '@elastic/eui';
import moment, { Moment } from 'moment';
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
} from '@elastic/charts';
import { useDelayedLoader } from '../../../../hooks/useDelayedLoader';
import {
  AnomalySummary,
  Monitor,
  MonitorAlert,
  Detector,
} from '../../../../models/interfaces';
import { get } from 'lodash';
import { prepareDataForChart } from '../../../DetectorResults/utils/anomalyResultUtils';
import { AlertsFlyout } from '../../../DetectorResults/components/AlertsFlyout/AlertsFlyout';
import { useDispatch } from 'react-redux';
import { searchES } from '../../../../redux/reducers/elasticsearch';
import { SetUpAlertsButton } from '../../../DetectorResults/components/SetupAlert/SetupAlertsButton';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { AlertsStat, AnomalyStatWithTooltip } from './AnomalyStat';
import { dateFormatter } from '../../../utils/helpers';

interface TotalAnomaliesChartProps {
  onDateRangeChange(
    startDate: Moment,
    endDate: Moment,
    dateRangeOption?: string
  ): void;
  title: string;
  anomalies: any[];
  annotations?: any[];
  isLoading: boolean;
  startDateTime: Moment;
  endDateTime: Moment;
  showAlerts?: boolean;
  anomalyGradeSeriesName: string;
  confidenceSeriesName: string;
  dateRangeOption: string;
  detectorId: string;
  detectorName: string;
  detector?: Detector;
  detectorInterval?: number;
  unit?: string;
  noFeature?: boolean;
  monitor?: Monitor;
}
export const TotalAnomaliesChart = React.memo(
  (props: TotalAnomaliesChartProps) => {
    const [anomalySummary, setAnomalySummary] = useState<AnomalySummary>({
      anomalyOccurrence: 0,
      minAnomalyGrade: 0.0,
      maxAnomalyGrade: 0.0,
      minConfidence: 0.0,
      maxConfidence: 0.0,
      lastAnomalyOccurrence: '',
    });
    const [showAlertsFlyout, setShowAlertsFlyout] = useState<boolean>(false);
    const [totalAlerts, setTotalAlerts] = useState<number | undefined>(
      undefined
    );
    const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
    const [alertAnnotations, setAlertAnnotations] = useState<any[]>([]);
    const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(false);

    const dispatch = useDispatch();
    const getTotalAlertsQuery = (monitorId: string, startTime: number) => {
      return {
        index: '.opendistro-alerting-alert-history*',
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

    const convertToAlerts = (response: any): MonitorAlert[] => {
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

    const createAlertAnnotations = (alerts: MonitorAlert[]): any[] => {
      return alerts.map((alert: MonitorAlert) => ({
        header: dateFormatter(alert.startTime),
        dataValue: alert.startTime, //+ (alert.endTime - alert.startTime)/2,
        details: alert.error
          ? `There is a severity ${alert.severity} alert with state ${
              alert.state
            } between ${dateFormatter(alert.startTime)} and ${dateFormatter(
              alert.endTime
            )}. Some error happened for this alert: ${alert.error}`
          : `There is a severity ${alert.severity} alert with state ${
              alert.state
            } between ${dateFormatter(alert.startTime)} and ${dateFormatter(
              alert.endTime
            )}`,
      }));
    };

    const getTotalAlertsOfMonitor = async (
      monitorId: string,
      startTime: number
    ) => {
      const searchResponse = await dispatch(
        searchES(getTotalAlertsQuery(monitorId, startTime))
      );
      return searchResponse;
    };

    useEffect(() => {
      async function getAlertCount(monitorId: string, startDateTime: number) {
        try {
          setIsLoadingAlerts(true);
          const result = await getTotalAlertsOfMonitor(
            monitorId,
            startDateTime
          );
          setIsLoadingAlerts(false);
          setTotalAlerts(
            get(result, 'data.response.aggregations.total_alerts.value')
          );
          const monitorAlerts = convertToAlerts(result);
          setAlerts(monitorAlerts);
          const annotations = createAlertAnnotations(monitorAlerts);
          setAlertAnnotations(annotations);
        } catch (err) {
          console.log(`Failed to get alerts for monitor ${monitorId}`);
          setIsLoadingAlerts(false);
        }
      }
      if (props.monitor && props.startDateTime) {
        getAlertCount(props.monitor.id, props.startDateTime.valueOf());
      }
    }, [props.monitor, props.startDateTime]);

    const getAnomalySummary = (anomalies: any[]): AnomalySummary => {
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
          ? moment(targetAnomalies[0].startTime).format('MM/DD hh:mm a')
          : '-';

      return {
        anomalyOccurrence: targetAnomalies.length,
        minAnomalyGrade:
          minAnomalyGrade > maxAnomalyGrade ? 0 : minAnomalyGrade,
        maxAnomalyGrade: maxAnomalyGrade,
        minConfidence: minConfidence > maxConfidence ? 0 : minConfidence,
        maxConfidence: maxConfidence,
        lastAnomalyOccurrence: lastAnomalyOccurrence,
      };
    };

    useEffect(() => {
      const summary = getAnomalySummary(props.anomalies);
      setAnomalySummary(summary);
    }, [props.anomalies]);

    const liveChartTimeFormatter = niceTimeFormatter([
      props.startDateTime.valueOf(),
      props.endDateTime.valueOf(),
    ]);
    const showLoader = useDelayedLoader(props.isLoading || isLoadingAlerts);
    const datePicker = () => {
      const options = [
        { value: 'last_1_hour', text: 'Last 1 hour' },
        { value: 'last_24_hours', text: 'Last 24 hours' },
        { value: 'last_7_days', text: 'Last 7 days' },
      ];
      return (
        <EuiSelect
          id="anomalyHistoryDatePicker"
          options={options}
          value={props.dateRangeOption}
          onChange={(e: any) => {
            if (e.target.value === 'last_1_hour') {
              props.onDateRangeChange(
                moment().subtract(1, 'hours'),
                moment(),
                'last_1_hour'
              );
            }
            if (e.target.value === 'last_24_hours') {
              props.onDateRangeChange(
                moment().subtract(24, 'hours'),
                moment(),
                'last_24_hours'
              );
            }
            if (e.target.value === 'last_7_days') {
              props.onDateRangeChange(
                moment().subtract(7, 'days'),
                moment(),
                'last_7_days'
              );
            }
          }}
          style={{ width: '145px' }}
        />
      );
    };
    const setUpAlertsButton = () => (
      <SetUpAlertsButton
        monitor={props.monitor}
        detectorId={props.detectorId}
        detectorName={props.detectorName}
        detectorInterval={get(props, 'detectorInterval', 1)}
        unit={get(props, 'unit', 'Minutes')}
      />
    );

    const anomalies = prepareDataForChart(
      props.anomalies,
      props.startDateTime,
      props.endDateTime
    );

    const disabledHistoryAnnotations = () => {
      // debugger;
      if (!props.detector) {
        return [];
      }
      const startTime = props.detector.disabledTime;
      const endTime = props.detector.enabled
        ? props.detector.enabledTime
        : props.endDateTime.valueOf();

      if (startTime) {
        const details =
          props.detector.enabled && props.detector.enabledTime
            ? `Detector was stopped from ${dateFormatter(
                startTime
              )} to ${dateFormatter(props.detector.enabledTime)}`
            : `Detector was stopped from ${dateFormatter(startTime)} until now`;
        const coordinateX0 =
          startTime >= props.startDateTime.valueOf()
            ? startTime
            : props.startDateTime.valueOf();
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
      return [];
    };

    return (
      <React.Fragment>
        <ContentPanel
          title={props.title}
          actions={
            props.showAlerts
              ? [datePicker(), setUpAlertsButton()]
              : [datePicker()]
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
                  titleSize="m"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <AnomalyStatWithTooltip
                  isLoading={props.isLoading}
                  isLoadingAlerts={isLoadingAlerts}
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
                  isLoading={props.isLoading}
                  isLoadingAlerts={isLoadingAlerts}
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
                  titleSize="m"
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
                        legendPosition={Position.Right}
                        // showLegendDisplayValue={false}
                      />
                      <RectAnnotation
                        dataValues={disabledHistoryAnnotations()}
                        id="anomalyAnnotations"
                        // annotationId={getAnnotationId('react')}
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
                        tickFormat={liveChartTimeFormatter}
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
                        xScaleType="time"
                        yScaleType="linear"
                        xAccessor={'plotTime'}
                        yAccessors={['confidence']}
                        color={['#017F75']}
                        data={anomalies}
                      />
                      <LineSeries
                        id="anomalyGrade"
                        name={props.anomalyGradeSeriesName}
                        data={anomalies}
                        xScaleType="time"
                        yScaleType="linear"
                        xAccessor={'plotTime'}
                        yAccessors={['anomalyGrade']}
                        color={['#D13212']}
                      />
                    </Chart>
                  )}
                </div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexGroup>
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
  }
);
