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
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
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
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import {
  AnomalySummary,
  Monitor,
  Detector,
  DateRange,
} from '../../../models/interfaces';
import { get } from 'lodash';
import { prepareDataForChart } from '../../utils/anomalyResultUtils';
import { AlertsFlyout } from '../components/AlertsFlyout/AlertsFlyout';

import { AlertsButton } from '../components/AlertsButton/AlertsButton';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import {
  AlertsStat,
  AnomalyStatWithTooltip,
} from '../components/AnomaliesStat/AnomalyStat';
import { AD_RESULT_DATE_RANGES } from '../../utils/constants';
import {
  getAlerts,
  convertAlerts,
  generateAlertAnnotations,
  getAnomalySummary,
  disabledHistoryAnnotations,
  INITIAL_ANOMALY_SUMMARY,
  ANOMALY_DATE_RANGE_OPTIONS,
} from '../utils/anomalyChartUtils';

interface AnomaliesChartProps {
  onDateRangeChange(
    startDate: Moment,
    endDate: Moment,
    dateRangeOption?: string
  ): void;
  title: string;
  anomalies: any[];
  annotations?: any[];
  isLoading: boolean;
  dateRange: DateRange;
  showAlerts?: boolean;
  anomalyGradeSeriesName: string;
  confidenceSeriesName: string;
  initialDateRangeOption: string;
  dateRangeOptions?: any[];
  detectorId: string;
  detectorName: string;
  detector?: Detector;
  detectorInterval?: number;
  unit?: string;
  noFeature?: boolean;
  monitor?: Monitor;
}
export const AnomaliesChart = React.memo((props: AnomaliesChartProps) => {
  const [anomalySummary, setAnomalySummary] = useState<AnomalySummary>(
    INITIAL_ANOMALY_SUMMARY
  );
  const [showAlertsFlyout, setShowAlertsFlyout] = useState<boolean>(false);
  const [totalAlerts, setTotalAlerts] = useState<number | undefined>(undefined);
  const [alertAnnotations, setAlertAnnotations] = useState<any[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(false);

  useEffect(() => {
    setAnomalySummary(getAnomalySummary(props.anomalies));
  }, [props.anomalies]);

  useEffect(() => {
    async function getMonitorAlerts(monitorId: string, startDateTime: number) {
      try {
        setIsLoadingAlerts(true);
        const result = await getAlerts(monitorId, startDateTime);
        setIsLoadingAlerts(false);
        setTotalAlerts(
          get(result, 'data.response.aggregations.total_alerts.value')
        );
        const monitorAlerts = convertAlerts(result);
        const annotations = generateAlertAnnotations(monitorAlerts);
        setAlertAnnotations(annotations);
      } catch (err) {
        console.error(`Failed to get alerts for monitor ${monitorId}`, err);
        setIsLoadingAlerts(false);
      }
    }
    if (props.monitor && props.dateRange.startDate) {
      getMonitorAlerts(props.monitor.id, props.dateRange.startDate.valueOf());
    }
  }, [props.monitor, props.dateRange.startDate]);

  const anomalyChartTimeFormatter = niceTimeFormatter([
    props.dateRange.startDate.valueOf(),
    props.dateRange.endDate.valueOf(),
  ]);

  const showLoader = useDelayedLoader(props.isLoading || isLoadingAlerts);

  const datePicker = () => (
    <EuiSelect
      id="anomalyHistoryDatePicker"
      options={
        props.dateRangeOptions
          ? props.dateRangeOptions
          : ANOMALY_DATE_RANGE_OPTIONS
      }
      value={props.initialDateRangeOption}
      onChange={(e: any) => {
        if (e.target.value === AD_RESULT_DATE_RANGES.LAST_1_HOUR) {
          props.onDateRangeChange(
            moment().subtract(1, 'hours'),
            moment(),
            AD_RESULT_DATE_RANGES.LAST_1_HOUR
          );
        }
        if (e.target.value === AD_RESULT_DATE_RANGES.LAST_24_HOURS) {
          props.onDateRangeChange(
            moment().subtract(24, 'hours'),
            moment(),
            AD_RESULT_DATE_RANGES.LAST_24_HOURS
          );
        }
        if (e.target.value === AD_RESULT_DATE_RANGES.LAST_7_DAYS) {
          props.onDateRangeChange(
            moment().subtract(7, 'days'),
            moment(),
            AD_RESULT_DATE_RANGES.LAST_7_DAYS
          );
        }
      }}
      style={{ width: '145px' }}
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

  const anomalies = prepareDataForChart(
    props.anomalies,
    props.dateRange.startDate,
    props.dateRange.endDate
  );

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
                isLoading={props.isLoading || isLoadingAlerts}
                // isLoadingAlerts={isLoadingAlerts}
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
                // isLoadingAlerts={isLoadingAlerts}
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
                    <Settings showLegend legendPosition={Position.Right} />
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
});
