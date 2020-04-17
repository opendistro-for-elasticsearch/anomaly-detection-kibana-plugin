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
} from '@elastic/eui';
import moment from 'moment';
import {
  Chart,
  Axis,
  BarSeries,
  niceTimeFormatter,
  Settings,
  LineAnnotation,
  AnnotationDomainTypes,
  LineAnnotationDatum,
} from '@elastic/charts';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'public/redux/reducers';
import { Detector } from 'public/models/interfaces';
import {
  getLiveAnomalyResults,
  prepareDataForChart,
} from '../utils/anomalyResultUtils';
import { get } from 'lodash';

interface AnomalyResultsLiveChartProps {
  detectorId: string;
  detector: Detector;
}

export const AnomalyResultsLiveChart = (
  props: AnomalyResultsLiveChartProps
) => {
  const UPDATE_INTERVAL = 5 * 1000; //poll anomaly result every 5 seconds
  const MONITORING_INTERVALS = 60;
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
    detectionInterval * MONITORING_INTERVALS,
    'minutes'
  );
  const endDateTime = moment();
  const anomalies = prepareDataForChart(
    liveAnomalyResults.liveAnomalies,
    startDateTime,
    endDateTime
  );
  const timeFormatter = niceTimeFormatter([
    startDateTime.valueOf(),
    endDateTime.valueOf(),
  ]);

  useEffect(() => {
    if (props.detector.enabled) {
      getLiveAnomalyResults(
        dispatch,
        props.detectorId,
        detectionInterval,
        MONITORING_INTERVALS
      );
      const intervalId = setInterval(
        () =>
          getLiveAnomalyResults(
            dispatch,
            props.detectorId,
            detectionInterval,
            MONITORING_INTERVALS
          ),
        UPDATE_INTERVAL
      );
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  const showLoader = useDelayedLoader(isLoading);

  const liveAnomaliesDescription = () => (
    <EuiText size="s" style={{ color: '#879196' }}>
      Live anomaly results during last {MONITORING_INTERVALS} intervals
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
      details: moment(value).format('MM/DD/YY h:mm a'),
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
      {isFullScreen ? 'Exit fullscreen' : 'View fullscreen'}
    </EuiButton>
  );

  return (
    <React.Fragment>
      <ContentPanel
        title={
          <EuiTitle size="s" className="content-panel-title">
            <h3>
              Live anomalies{' '}
              <EuiBadge color={props.detector.enabled ? '#DB1374' : '#DDD'}>
                Live
              </EuiBadge>
            </h3>
          </EuiTitle>
        }
        subTitle={props.detector.enabled ? liveAnomaliesDescription() : null}
        actions={[fullScreenButton()]}
        contentPanelClassName={isFullScreen ? 'full-screen' : undefined}
      >
        {props.detector.enabled ? (
          <EuiFlexGroup
            justifyContent="spaceBetween"
            style={{
              height: isFullScreen ? '400px' : '200px',
              opacity: showLoader ? 0.2 : 1,
            }}
          >
            <EuiFlexItem grow={true}>
              <Chart>
                <Settings />
                <LineAnnotation
                  id="annotationNow"
                  domainType={AnnotationDomainTypes.XDomain}
                  dataValues={nowAnnotation([endDateTime.valueOf(), 1])}
                  style={nowLineStyle}
                  // @ts-ignore
                  marker={'now'}
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
                  // showGridLines
                />
                <BarSeries
                  id="Anomaly grade"
                  name="Anomaly grade"
                  data={anomalies}
                  xScaleType="time"
                  yScaleType="linear"
                  xAccessor={'plotTime'}
                  yAccessors={['anomalyGrade']}
                  color={['#D13212']}
                />
              </Chart>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiText>
                <h5>Detector Interval</h5>
                <p style={{ color: '#454545', fontSize: '15px' }}>
                  {get(props.detector, 'detectionInterval.period.interval', '')}{' '}
                  {get(
                    props.detector,
                    'detectionInterval.period.unit',
                    ''
                  ).toLowerCase()}
                </p>
                <h5>Latest anomlay</h5>
                <p style={{ color: '#454545', fontSize: '15px' }}>
                  Anomaly grade:{' '}
                  {latestAnomalyGrade ? latestAnomalyGrade.anomalyGrade : '-'}
                  <br />
                  Confidence:{' '}
                  {latestAnomalyGrade ? latestAnomalyGrade.confidence : '-'}
                </p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          <EuiText>Not available when the detector is stopped.</EuiText>
        )}
      </ContentPanel>
    </React.Fragment>
  );
};
