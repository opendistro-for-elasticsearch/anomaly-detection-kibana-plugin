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

import React, { useState, useEffect, useCallback, Fragment } from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTabs,
  EuiTab,
  EuiLoadingSpinner,
} from '@elastic/eui';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import {
  AnomalyData,
  Detector,
  Monitor,
  DateRange,
  AnomalySummary,
  Anomalies,
} from '../../../models/interfaces';
import {
  filterWithDateRange,
  getAnomalySummaryQuery,
  getBucketizedAnomalyResultsQuery,
  parseBucketizedAnomalyResults,
  parseAnomalySummary,
  parsePureAnomalies,
  buildParamsForGetAnomalyResultsWithDateRange,
  FEATURE_DATA_CHECK_WINDOW_OFFSET,
} from '../../utils/anomalyResultUtils';
import { get } from 'lodash';
import { AnomalyResultsTable } from './AnomalyResultsTable';
import { AnomaliesChart } from '../../AnomalyCharts/containers/AnomaliesChart';
import { FeatureBreakDown } from '../../AnomalyCharts/containers/FeatureBreakDown';
import { minuteDateFormatter } from '../../utils/helpers';
import { ANOMALY_HISTORY_TABS } from '../utils/constants';
import { searchES } from '../../../redux/reducers/elasticsearch';
import { MIN_IN_MILLI_SECS } from '../../../../server/utils/constants';
import { INITIAL_ANOMALY_SUMMARY } from '../../AnomalyCharts/utils/constants';
import { MAX_ANOMALIES } from '../../../utils/constants';
import { getDetectorResults } from '../../../redux/reducers/anomalyResults';

interface AnomalyHistoryProps {
  detector: Detector;
  monitor: Monitor | undefined;
  createFeature(): void;
  isFeatureDataMissing?: boolean;
}

export const AnomalyHistory = (props: AnomalyHistoryProps) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const initialStartDate = moment().subtract(7, 'days');
  const initialEndDate = moment();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate.valueOf(),
    endDate: initialEndDate.valueOf(),
  });
  const [zoomRange, setZoomRange] = useState<DateRange>({
    startDate: initialStartDate.valueOf(),
    endDate: initialEndDate.valueOf(),
  });
  const [selectedTabId, setSelectedTabId] = useState<string>(
    ANOMALY_HISTORY_TABS.FEATURE_BREAKDOWN
  );

  const [isLoadingAnomalyResults, setIsLoadingAnomalyResults] = useState<
    boolean
  >(false);
  const [bucketizedAnomalyResults, setBucketizedAnomalyResults] = useState<
    Anomalies
  >();
  const [pureAnomalies, setPureAnomalies] = useState<AnomalyData[]>([]);
  const [bucketizedAnomalySummary, setBucketizedAnomalySummary] = useState<
    AnomalySummary
  >(INITIAL_ANOMALY_SUMMARY);

  useEffect(() => {
    // We load at most 10k AD result data points for one call. If user choose
    // a big time range which may have more than 10k AD results, will use bucket
    // aggregation to load data points in whole time range with larger interval.
    async function getBucketizedAnomalyResults() {
      try {
        setIsLoadingAnomalyResults(true);
        const anomalySummaryResult = await dispatch(
          searchES(
            getAnomalySummaryQuery(
              dateRange.startDate,
              dateRange.endDate,
              props.detector.id
            )
          )
        );
        setPureAnomalies(parsePureAnomalies(anomalySummaryResult));
        setBucketizedAnomalySummary(parseAnomalySummary(anomalySummaryResult));
        const result = await dispatch(
          searchES(
            getBucketizedAnomalyResultsQuery(
              dateRange.startDate,
              dateRange.endDate,
              1,
              props.detector.id
            )
          )
        );
        setBucketizedAnomalyResults(parseBucketizedAnomalyResults(result));
      } catch (err) {
        console.error(
          `Failed to get anomaly results for ${props.detector.id}`,
          err
        );
      } finally {
        setIsLoadingAnomalyResults(false);
        fetchRawAnomalyResults(false);
      }
    }

    if (
      dateRange.endDate - dateRange.startDate >
      detectorInterval * MIN_IN_MILLI_SECS * MAX_ANOMALIES
    ) {
      getBucketizedAnomalyResults();
    } else {
      setBucketizedAnomalyResults(undefined);
      fetchRawAnomalyResults(true);
    }
  }, [dateRange]);

  const detectorInterval = get(
    props.detector,
    'detectionInterval.period.interval',
    1
  );

  const fetchRawAnomalyResults = async (
    shouldSetAtomicAnomalyResults: boolean
  ) => {
    if (shouldSetAtomicAnomalyResults) {
      setIsLoading(true);
    }

    try {
      const params = buildParamsForGetAnomalyResultsWithDateRange(
        dateRange.startDate -
          FEATURE_DATA_CHECK_WINDOW_OFFSET *
            detectorInterval *
            MIN_IN_MILLI_SECS,
        dateRange.endDate
      );
      const detectorResultResponse = await dispatch(
        getDetectorResults(props.detector.id, params)
      );
      const anomaliesData = get(detectorResultResponse, 'data.response', []);

      if (shouldSetAtomicAnomalyResults) {
        setAtomicAnomalyResults({
          anomalies: get(anomaliesData, 'results', []),
          featureData: get(anomaliesData, 'featureResults', []),
        });
      }
      setRawAnomalyResults({
        anomalies: get(anomaliesData, 'results', []),
        featureData: get(anomaliesData, 'featureResults', []),
      });
    } catch (err) {
      console.error(
        `Failed to get atomic anomaly results for ${props.detector.id}`,
        err
      );
    } finally {
      if (shouldSetAtomicAnomalyResults) {
        setIsLoading(false);
      }
    }
  };

  const [atomicAnomalyResults, setAtomicAnomalyResults] = useState<Anomalies>();
  const [rawAnomalyResults, setRawAnomalyResults] = useState<Anomalies>();

  const anomalyResults = bucketizedAnomalyResults
    ? bucketizedAnomalyResults
    : atomicAnomalyResults;

  const handleDateRangeChange = useCallback(
    (startDate: number, endDate: number, dateRangeOption?: string) => {
      setDateRange({
        startDate: startDate,
        endDate: endDate,
      });
    },
    []
  );

  const handleZoomChange = useCallback((startDate: number, endDate: number) => {
    setZoomRange({
      startDate: startDate,
      endDate: endDate,
    });
  }, []);

  const annotations = anomalyResults
    ? get(anomalyResults, 'anomalies', [])
        //@ts-ignore
        .filter((anomaly: AnomalyData) => anomaly.anomalyGrade > 0)
        .map((anomaly: AnomalyData) => ({
          coordinates: {
            x0: anomaly.startTime,
            x1: anomaly.endTime,
          },
          details: `There is an anomaly with confidence ${
            anomaly.confidence
          } between ${minuteDateFormatter(
            anomaly.startTime
          )} and ${minuteDateFormatter(anomaly.endTime)}`,
        }))
    : [];

  const tabs = [
    {
      id: ANOMALY_HISTORY_TABS.FEATURE_BREAKDOWN,
      name: 'Feature breakdown',
      disabled: false,
    },
    {
      id: ANOMALY_HISTORY_TABS.ANOMALY_OCCURRENCE,
      name: 'Anomaly occurrence',
      disabled: false,
    },
  ];

  const onSelectedTabChanged = (tabId: string) => {
    setSelectedTabId(tabId);
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
        disabled={tab.disabled}
        key={index}
      >
        {tab.name}
      </EuiTab>
    ));
  };

  return (
    <Fragment>
      <AnomaliesChart
        title="Anomaly history"
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onZoomRangeChange={handleZoomChange}
        anomalies={anomalyResults ? anomalyResults.anomalies : []}
        bucketizedAnomalies={bucketizedAnomalyResults !== undefined}
        anomalySummary={bucketizedAnomalySummary}
        isLoading={isLoading || isLoadingAnomalyResults}
        anomalyGradeSeriesName="Anomaly grade"
        confidenceSeriesName="Confidence"
        showAlerts={true}
        detectorId={props.detector.id}
        detectorName={props.detector.name}
        detector={props.detector}
        detectorInterval={get(
          props.detector,
          'detectionInterval.period.interval'
        )}
        unit={get(props.detector, 'detectionInterval.period.unit')}
        monitor={props.monitor}
      >
        <EuiTabs>{renderTabs()}</EuiTabs>

        {isLoading || isLoadingAnomalyResults ? (
          <EuiFlexGroup
            justifyContent="spaceAround"
            style={{ height: '200px', paddingTop: '100px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="xl" />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          <div style={{ padding: '20px', backgroundColor: '#F7F7F7' }}>
            {selectedTabId === 'featureBreakdown' ? (
              <FeatureBreakDown
                detector={props.detector}
                // @ts-ignore
                anomaliesResult={anomalyResults}
                rawAnomalyResults={rawAnomalyResults}
                annotations={annotations}
                isLoading={isLoading}
                dateRange={zoomRange}
                featureDataSeriesName="Feature output"
                showFeatureMissingDataPointAnnotation={props.detector.enabled}
                isFeatureDataMissing={props.isFeatureDataMissing}
              />
            ) : (
              <AnomalyResultsTable
                anomalies={
                  bucketizedAnomalyResults === undefined
                    ? anomalyResults
                      ? filterWithDateRange(
                          anomalyResults.anomalies,
                          zoomRange,
                          'plotTime'
                        )
                      : []
                    : pureAnomalies
                }
              />
            )}
          </div>
        )}
      </AnomaliesChart>
    </Fragment>
  );
};
