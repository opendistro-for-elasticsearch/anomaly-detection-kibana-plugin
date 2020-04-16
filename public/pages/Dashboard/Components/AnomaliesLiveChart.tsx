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

export interface AnomaliesLiveChartProps {
  allDetectorsSelected: boolean;
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
    startDateTime: moment().subtract(30, 'minutes'),
    endDateTime: moment(),
  });

  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );

  const [lastAnomalyResult, setLastAnomalyResult] = useState();

  const [liveAnomalyData, setLiveAnomalyData] = useState([] as object[]);

  const getLiveAnomalyResults = async () => {
    const finalLiveAnomalyResult = await getLatestAnomalyResultsForDetectorsByTimeRange(
      searchES,
      props.selectedDetectors,
      '30m',
      MAX_LIVE_DETECTORS,
      dispatch
    );

    setLiveAnomalyData(finalLiveAnomalyResult);
    if (!isEmpty(finalLiveAnomalyResult)) {
      setLastAnomalyResult(finalLiveAnomalyResult[0]);
    } else {
      setLastAnomalyResult(undefined);
    }
    setLiveTimeRange({
      startDateTime: moment().subtract(30, 'minutes'),
      endDateTime: moment(),
    });
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
        [AD_DOC_FIELDS.DETECTOR_NAME]: '',
        [AD_DOC_FIELDS.PLOT_TIME]: currentTime,
        [AD_DOC_FIELDS.ANOMALY_GRADE]: null,
      });
    }
    return result;
  };

  const timeNowAnnotation = {
    dataValue: getFloorPlotTime(liveTimeRange.endDateTime.valueOf()),
    header: 'Now',
    details: liveTimeRange.endDateTime.format('MM/DD/YY h:mm a'),
  } as LineAnnotationDatum;

  const annotations = [timeNowAnnotation];

  // Add View full screen button
  // Issue link: https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/issues/26
  return (
    <ContentPanel
      title={[
        <EuiTitle size={'s'} className={'content-panel-title'}>
          <h3>{'Live Anomalies'}</h3>
        </EuiTitle>,
        <EuiBadge color={'#db1374'}>{'Live'}</EuiBadge>,
      ]}
      subTitle={
        <EuiFlexItem>
          <EuiText className={'live-anomaly-results-subtile'}>
            <p>
              {'Live anomaly results across detectors for the last 30 minutes'}
            </p>
          </EuiText>
        </EuiFlexItem>
      }
    >
      <EuiFlexGroup style={{ padding: '10px' }}>
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
        <EuiFlexItem>
          <EuiStat
            description={'Last updated time'}
            title={liveTimeRange.endDateTime.format('MM/DD/YYYY hh:mm a')}
            titleSize="s"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <div
        style={{
          height: '300px',
          width: '100%',
          opacity: 1,
        }}
      >
        {elasticsearchState.requesting ? (
          <EuiFlexGroup justifyContent="center">
            <EuiFlexItem grow={false}>
              <EuiLoadingChart size="m" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiLoadingChart size="l" />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiLoadingChart size="xl" />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          [
            <EuiTitle size="xxs" style={{ 'margin-left': '10px' }}>
              <h4>10 detectors with the most recent anomaly occurrence</h4>
            </EuiTitle>,
            <Chart>
              <Settings showLegend legendPosition={Position.Right} />
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
                id={'Detectors Anomaly grade'}
                xScaleType={ScaleType.Time}
                timeZone="local"
                yScaleType="linear"
                xAccessor={AD_DOC_FIELDS.PLOT_TIME}
                yAccessors={[AD_DOC_FIELDS.ANOMALY_GRADE]}
                splitSeriesAccessors={[AD_DOC_FIELDS.DETECTOR_NAME]}
                data={prepareVisualizedAnomalies(visualizedAnomalies)}
              />
            </Chart>,
          ]
        )}
      </div>
    </ContentPanel>
  );
};
