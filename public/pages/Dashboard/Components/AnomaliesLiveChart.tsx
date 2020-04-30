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
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DetectorListItem } from '../../../models/interfaces';
import {
  AD_DOC_FIELDS,
  MIN_IN_MILLI_SECS,
} from '../../../../server/utils/constants';
import {
  EuiBadge,
  EuiButton,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingChart,
  //@ts-ignore
  EuiStat,
} from '@elastic/eui';
import { searchES } from '../../../redux/reducers/elasticsearch';
import { get, isEmpty } from 'lodash';
import moment, { Moment } from 'moment';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  Chart,
  Axis,
  Settings,
  Position,
  BarSeries,
  niceTimeFormatter,
  ScaleType,
  LineAnnotation,
  AnnotationDomainTypes,
  LineAnnotationDatum,
} from '@elastic/charts';
import { EuiText, EuiTitle } from '@elastic/eui';
import React from 'react';
import { TIME_NOW_LINE_STYLE } from '../utils/constants';
import {
  visualizeAnomalyResultForXYChart,
  getFloorPlotTime,
  getLatestAnomalyResultsForDetectorsByTimeRange,
} from '../utils/utils';
import { AppState } from '../../../redux/reducers';
import { MAX_ANOMALIES } from '../../../utils/constants';

export interface AnomaliesLiveChartProps {
  selectedDetectors: DetectorListItem[];
}

interface LiveTimeRangeState {
  startDateTime: Moment;
  endDateTime: Moment;
}

const MAX_LIVE_DETECTORS = 10;

export const AnomaliesLiveChart = (props: AnomaliesLiveChartProps) => {
  const dispatch = useDispatch();

  const [liveTimeRange, setLiveTimeRange] = useState<LiveTimeRangeState>({
    startDateTime: moment().subtract(31, 'minutes'),
    endDateTime: moment(),
  });

  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );

  const selectedDetectorIds = new Set(
    props.selectedDetectors.map(detectorItem => detectorItem.id)
  );

  const latestAnomalousDetectors = new Set(
    get(elasticsearchState.searchResult, 'hits.hits', [])
      .filter(
        //@ts-ignore
        hit =>
          get(hit, '_source.data_start_time', 0) >
          liveTimeRange.startDateTime.valueOf()
      )
      .filter(
        //@ts-ignore
        hit => get(hit, '_source.anomaly_grade', 0) > 0
      )
      .map(
        //@ts-ignore
        hit => get(hit, '_source.detector_id', '')
      )
      .filter(
        //@ts-ignore
        detectorId => selectedDetectorIds.has(detectorId)
      )
  );

  const latestDetectors = new Set(
    get(elasticsearchState.searchResult, 'hits.hits', [])
      .filter(
        //@ts-ignore
        hit =>
          get(hit, '_source.data_start_time', 0) >
          liveTimeRange.startDateTime.valueOf()
      )
      .map(
        //@ts-ignore
        hit => get(hit, '_source.detector_id', '')
      )
      .filter(
        //@ts-ignore
        detectorId => selectedDetectorIds.has(detectorId)
      )
  );

  const [lastAnomalyResult, setLastAnomalyResult] = useState<object>();

  const [liveAnomalyData, setLiveAnomalyData] = useState([] as object[]);

  const [isFullScreen, setIsFullScreen] = useState(false);

  const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(true);

  const hasLatestLiveAnomalyResult = latestDetectors.size > 0;

  const getLiveAnomalyResults = async () => {
    setIsLoadingAnomalies(true);
    const latestLiveAnomalyResult = await getLatestAnomalyResultsForDetectorsByTimeRange(
      searchES,
      props.selectedDetectors,
      '30m',
      dispatch,
      -1,
      MAX_ANOMALIES,
      MAX_LIVE_DETECTORS
    );

    const nonZeroAnomalyResult = latestLiveAnomalyResult.filter(
      anomalyData => get(anomalyData, AD_DOC_FIELDS.ANOMALY_GRADE, 0) > 0
    );
    setLiveAnomalyData(nonZeroAnomalyResult);

    if (!isEmpty(nonZeroAnomalyResult)) {
      setLastAnomalyResult(nonZeroAnomalyResult[0]);
    } else {
      setLastAnomalyResult(undefined);
    }
    setLiveTimeRange({
      startDateTime: moment().subtract(31, 'minutes'),
      endDateTime: moment(),
    });
    setIsLoadingAnomalies(false);
  };

  useEffect(() => {
    getLiveAnomalyResults();
    const id = setInterval(getLiveAnomalyResults, MIN_IN_MILLI_SECS);
    return () => {
      clearInterval(id);
    };
  }, [props.selectedDetectors]);

  const timeFormatter = niceTimeFormatter([
    liveTimeRange.startDateTime.valueOf(),
    liveTimeRange.endDateTime.valueOf(),
  ]);

  const visualizedAnomalies = liveAnomalyData.flatMap(anomalyResult =>
    visualizeAnomalyResultForXYChart(anomalyResult)
  );
  const prepareVisualizedAnomalies = (
    liveVisualizedAnomalies: object[]
  ): object[] => {
    // add data point placeholder at every minute,
    // to ensure chart evenly distrubted
    const existingPlotTimes = liveVisualizedAnomalies.map(anomaly =>
      getFloorPlotTime(get(anomaly, AD_DOC_FIELDS.PLOT_TIME, 0))
    );
    const result = [...liveVisualizedAnomalies];

    for (
      let currentTime = getFloorPlotTime(liveTimeRange.startDateTime.valueOf());
      currentTime <= liveTimeRange.endDateTime.valueOf();
      currentTime += MIN_IN_MILLI_SECS
    ) {
      if (existingPlotTimes.includes(currentTime)) {
        continue;
      }
      result.push({
        [AD_DOC_FIELDS.DETECTOR_NAME]: !isEmpty(liveAnomalyData) ? '' : null,
        [AD_DOC_FIELDS.PLOT_TIME]: currentTime,
        [AD_DOC_FIELDS.ANOMALY_GRADE]: null,
      });
    }

    return result;
  };

  const timeNowAnnotation = {
    dataValue: getFloorPlotTime(liveTimeRange.endDateTime.valueOf()),
    header: 'Now',
    details: liveTimeRange.endDateTime.format('MM/DD/YY h:mm A'),
  } as LineAnnotationDatum;

  const annotations = [timeNowAnnotation];

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
    <ContentPanel
      title={
        <EuiTitle size="s">
          <h3>
            Live anomalies{' '}
            <EuiBadge color={hasLatestLiveAnomalyResult ? '#DB1374' : '#DDD'}>
              Live
            </EuiBadge>
          </h3>
        </EuiTitle>
      }
      subTitle={
        <EuiFlexItem>
          <EuiText className={'live-anomaly-results-subtile'}>
            <p>
              {'Live anomaly results across detectors for the last 30 minutes. ' +
                'The results refresh every 1 minute. ' +
                'For each detector, if an anomaly occurrence is detected at the end of the detector interval, ' +
                'you will see a bar representing its anomaly grade.'}
            </p>
          </EuiText>
        </EuiFlexItem>
      }
      actions={[fullScreenButton()]}
      contentPanelClassName={isFullScreen ? 'full-screen' : undefined}
    >
      {isLoadingAnomalies ? (
        <EuiFlexGroup justifyContent="center">
          <EuiFlexItem grow={false}>
            <EuiLoadingChart size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : !hasLatestLiveAnomalyResult ? (
        <EuiText
          style={{
            color: '#666666',
            paddingTop: '12px',
            paddingBottom: '4px',
          }}
        >
          <p>
            All matching detectors are under initialization or stopped for the
            last 30 minutes. Please adjust filters or come back later.
          </p>
        </EuiText>
      ) : (
        // show below content as long as there exists anomaly data,
        // regardless of whether anomaly grade is 0 or larger.
        [
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiStat
                description={'Last updated time'}
                title={liveTimeRange.endDateTime.format('MM/DD/YYYY hh:mm A')}
                titleSize="s"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                description={'Detector with most recent anomaly occurrence'}
                title={
                  lastAnomalyResult === undefined
                    ? '-'
                    : get(lastAnomalyResult, AD_DOC_FIELDS.DETECTOR_NAME, '')
                }
                titleSize="s"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                description={'Most recent anomaly grade'}
                title={
                  lastAnomalyResult === undefined
                    ? '-'
                    : get(lastAnomalyResult, AD_DOC_FIELDS.ANOMALY_GRADE, 0)
                }
                titleSize="s"
              />
            </EuiFlexItem>
          </EuiFlexGroup>,
          <div>
            {[
              // only show below message when anomalousDetectorCount >= MAX_LIVE_DETECTORS
              latestAnomalousDetectors.size >= MAX_LIVE_DETECTORS ? (
                <EuiCallOut
                  size="s"
                  title={`You are viewing ${MAX_LIVE_DETECTORS} detectors with the most recent anomaly occurrences.`}
                  style={{
                    width: '88%', // ensure width reaches NOW annotation line
                    marginTop: '20px',
                    marginBottom: '20px',
                  }}
                >
                  <p>
                    {`${MAX_LIVE_DETECTORS} detectors with the most recent anomalies are shown on the
                    chart. Adjust filters if there are specific detectors you
                    would like to monitor.`}
                  </p>
                </EuiCallOut>
              ) : latestAnomalousDetectors.size === 0 ? (
                // all the data points have anomaly grade as 0
                <EuiCallOut
                  color="success"
                  size="s"
                  title="No anomalies found during the last 30 minutes across all matching detectors."
                  style={{
                    width: '96%', // ensure width reaches NOW line
                    marginTop: '20px',
                    marginBottom: '20px',
                  }}
                />
              ) : null,
              <div
                style={{
                  height: isFullScreen ? '400px' : '200px',
                  width: '100%',
                  opacity: 1,
                }}
              >
                <Chart>
                  <Settings
                    // hide legend if there only exists anomalies with 0 anomaly grade
                    showLegend={!isEmpty(liveAnomalyData)}
                    legendPosition={Position.Right}
                    xDomain={{
                      min: liveTimeRange.startDateTime.valueOf(),
                      max: liveTimeRange.endDateTime.valueOf(),
                    }}
                  />
                  <LineAnnotation
                    domainType={AnnotationDomainTypes.XDomain}
                    dataValues={annotations}
                    style={TIME_NOW_LINE_STYLE}
                    marker={'Now'}
                  />
                  <Axis
                    id={'bottom'}
                    position={Position.Bottom}
                    tickFormat={timeFormatter}
                    showOverlappingTicks={false}
                  />
                  <Axis
                    id={'left'}
                    title={'Anomaly grade'}
                    position={Position.Left}
                    domain={{ min: 0, max: 1 }}
                  />
                  <BarSeries
                    id={'Detector Anomaly grade'}
                    xScaleType={ScaleType.Time}
                    timeZone="local"
                    yScaleType="linear"
                    xAccessor={AD_DOC_FIELDS.PLOT_TIME}
                    yAccessors={[AD_DOC_FIELDS.ANOMALY_GRADE]}
                    splitSeriesAccessors={[AD_DOC_FIELDS.DETECTOR_NAME]}
                    data={prepareVisualizedAnomalies(visualizedAnomalies)}
                  />
                </Chart>
              </div>,
            ]}
          </div>,
        ]
      )}
    </ContentPanel>
  );
};
