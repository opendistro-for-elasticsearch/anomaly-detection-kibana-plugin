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

import React, { useEffect, useState } from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiBadge,
  EuiButton,
  EuiTitle,
  EuiCallOut,
  EuiStat,
} from '@elastic/eui';
import moment from 'moment';
import {
  Chart,
  Axis,
  BarSeries,
  niceTimeFormatter,
  Settings,
  LineAnnotation,
  RectAnnotation,
  AnnotationDomainTypes,
  LineAnnotationDatum,
  ScaleType,
} from '@elastic/charts';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../../redux/reducers';
import { Detector, AnomalyData } from '../../../models/interfaces';
import {
  getLiveAnomalyResults,
  prepareDataForChart,
} from '../../utils/anomalyResultUtils';
import { get } from 'lodash';
import {
  CHART_FIELDS,
  LIVE_CHART_CONFIG,
  CHART_COLORS,
} from '../../AnomalyCharts/utils/constants';
import { getFloorPlotTime } from '../../../../server/utils/helpers';
import { LIVE_ANOMALY_CHART_THEME } from '../utils/constants';
import { DETECTOR_STATE } from '../../../utils/constants';
import { dateFormatter } from '../../utils/helpers';
import { darkModeEnabled } from '../../../utils/kibanaUtils';

interface AnomalyResultsLiveChartProps {
  detector: Detector;
}

export const AnomalyResultsLiveChart = (
  props: AnomalyResultsLiveChartProps
) => {
  const dispatch = useDispatch();

  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const isLoading = useSelector(
    (state: AppState) => state.liveAnomalyResults.requesting
  );
  const liveAnomalyResults = useSelector(
    (state: AppState) => state.liveAnomalyResults
  );
  const detectionInterval = get(
    props.detector,
    'detectionInterval.period.interval',
    1
  );
  const startDateTime = moment().subtract(
    detectionInterval * LIVE_CHART_CONFIG.MONITORING_INTERVALS,
    'minutes'
  );
  const endDateTime = moment();
  const anomalies = prepareDataForChart(
    liveAnomalyResults.liveAnomalies,
    {
      startDate: startDateTime.valueOf(),
      endDate: endDateTime.valueOf(),
    },
    get(props.detector, 'detectionInterval.period.interval', 1),
    getFloorPlotTime
  );

  const annotations = liveAnomalyResults
    ? get(liveAnomalyResults, 'liveAnomalies', [])
        //@ts-ignore
        .filter((anomaly: AnomalyData) => anomaly.anomalyGrade > 0)
        .map((anomaly: AnomalyData) => ({
          coordinates: {
            x0:
              anomaly.startTime + (anomaly.endTime - anomaly.startTime) * 0.05,
            x1: anomaly.endTime - (anomaly.endTime - anomaly.startTime) * 0.05,
          },
          details: `Anomaly detected with anomaly grade ${
            anomaly.anomalyGrade
          } confidence ${anomaly.confidence} between ${dateFormatter(
            anomaly.startTime
          )} and ${dateFormatter(anomaly.endTime)}`,
        }))
    : [];

  const timeFormatter = niceTimeFormatter([
    startDateTime.valueOf(),
    endDateTime.valueOf(),
  ]);

  useEffect(() => {
    if (props.detector.curState === DETECTOR_STATE.RUNNING) {
      getLiveAnomalyResults(
        dispatch,
        props.detector.id,
        detectionInterval,
        LIVE_CHART_CONFIG.MONITORING_INTERVALS
      );
      const intervalId = setInterval(
        () =>
          getLiveAnomalyResults(
            dispatch,
            props.detector.id,
            detectionInterval,
            LIVE_CHART_CONFIG.MONITORING_INTERVALS
          ),
        LIVE_CHART_CONFIG.REFRESH_INTERVAL_IN_SECONDS
      );
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  const showLoader = useDelayedLoader(isLoading);

  const liveAnomaliesDescription = () => (
    <EuiText className={'anomaly-distribution-subtitle'}>
      Live anomaly shows anomaly results during the last{' '}
      {LIVE_CHART_CONFIG.MONITORING_INTERVALS} intervals (
      {LIVE_CHART_CONFIG.MONITORING_INTERVALS *
        props.detector.detectionInterval.period.interval}{' '}
      minutes).
    </EuiText>
  );

  const nowLineStyle = {
    line: {
      strokeWidth: 1,
      stroke: '#3F3F3F',
      dash: [1, 2],
      opacity: 0.8,
    },
  };

  const nowAnnotation = (values: any[]): LineAnnotationDatum[] => {
    return values.map((value, index) => ({
      dataValue: value,
      header: 'Now',
      details: moment(value).format('MM/DD/YY h:mm A'),
    }));
  };

  const latestAnomalyGrade = get(liveAnomalyResults, 'liveAnomalies', []).find(
    anomaly => anomaly.anomalyGrade > 0
  );

  const fullScreenButton = () => (
    <EuiButton
      onClick={() => setIsFullScreen(isFullScreen => !isFullScreen)}
      iconType={isFullScreen ? 'exit' : 'fullScreen'}
      aria-label="View full screen"
    >
      {isFullScreen ? 'Exit full screen' : 'View full screen'}
    </EuiButton>
  );

  return (
    <React.Fragment>
      <ContentPanel
        title={
          <EuiTitle size="s">
            <h3>
              Live anomalies{' '}
              <EuiBadge
                color={
                  props.detector.curState === DETECTOR_STATE.RUNNING
                    ? '#DB1374'
                    : '#DDD'
                }
              >
                Live
              </EuiBadge>
            </h3>
          </EuiTitle>
        }
        subTitle={
          props.detector.curState === DETECTOR_STATE.RUNNING
            ? liveAnomaliesDescription()
            : null
        }
        actions={[fullScreenButton()]}
        contentPanelClassName={isFullScreen ? 'full-screen' : undefined}
      >
        {props.detector.curState === DETECTOR_STATE.RUNNING ? (
          <EuiFlexGroup
            justifyContent="spaceBetween"
            style={{
              height: isFullScreen ? '400px' : '200px',
              opacity: showLoader ? 0.2 : 1,
            }}
          >
            <EuiFlexItem grow={true} style={{ marginRight: '0px' }}>
              {get(liveAnomalyResults, 'liveAnomalies', []).length === 0 ||
              !latestAnomalyGrade ? (
                <EuiCallOut
                  color="success"
                  size="s"
                  title={`No anomalies found during the last ${
                    LIVE_CHART_CONFIG.MONITORING_INTERVALS
                  } intervals (${LIVE_CHART_CONFIG.MONITORING_INTERVALS *
                    props.detector.detectionInterval.period
                      .interval} minutes).`}
                  style={{
                    width: '97%', // ensure width reaches NOW line
                  }}
                />
              ) : null}
              <Chart>
                <Settings theme={LIVE_ANOMALY_CHART_THEME} />
                <LineAnnotation
                  id="annotationNow"
                  domainType={AnnotationDomainTypes.XDomain}
                  dataValues={nowAnnotation([endDateTime.valueOf(), 1])}
                  style={nowLineStyle}
                  // @ts-ignore
                  marker={'now'}
                />
                <RectAnnotation
                  dataValues={annotations || []}
                  id="annotations"
                  style={{
                    stroke: darkModeEnabled()
                      ? 'red'
                      : CHART_COLORS.ANOMALY_GRADE_COLOR,
                    strokeWidth: 1,
                    opacity: 0.8,
                    fill: darkModeEnabled()
                      ? 'red'
                      : CHART_COLORS.ANOMALY_GRADE_COLOR,
                  }}
                />
                <Axis
                  id="bottom"
                  position="bottom"
                  tickFormat={timeFormatter}
                />
                <Axis
                  id="left"
                  title={'Anomaly grade'}
                  position="left"
                  domain={{ min: 0, max: 1 }}
                />
                <BarSeries
                  id="Anomaly grade"
                  name="Anomaly grade"
                  data={anomalies}
                  xScaleType={ScaleType.Time}
                  yScaleType={ScaleType.Linear}
                  xAccessor={CHART_FIELDS.PLOT_TIME}
                  yAccessors={[CHART_FIELDS.ANOMALY_GRADE]}
                />
              </Chart>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ marginLeft: '0px' }}>
              <EuiStat
                title={`${get(
                  props.detector,
                  'detectionInterval.period.interval',
                  ''
                )} ${
                  get(props.detector, 'detectionInterval.period.interval', 0) >
                  1
                    ? get(
                        props.detector,
                        'detectionInterval.period.unit',
                        ''
                      ).toLowerCase()
                    : get(props.detector, 'detectionInterval.period.unit', '')
                        .toLowerCase()
                        .slice(0, -1)
                }`}
                description="Detector interval"
                titleSize="s"
              />
              <EuiStat
                title={
                  latestAnomalyGrade ? latestAnomalyGrade.anomalyGrade : '-'
                }
                description="Latest anomaly grade"
                titleSize="s"
              />
              <EuiStat
                title={latestAnomalyGrade ? latestAnomalyGrade.confidence : '-'}
                description="Latest confidence"
                titleSize="s"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          <EuiText>{`Not available when the detector is ${props.detector.curState.toLowerCase()}.`}</EuiText>
        )}
      </ContentPanel>
    </React.Fragment>
  );
};
