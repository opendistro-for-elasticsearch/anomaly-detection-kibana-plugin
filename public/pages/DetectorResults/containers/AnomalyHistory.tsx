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

import React, {
  useState,
  useEffect,
  useCallback,
  Fragment,
  useRef,
} from 'react';

import { isEmpty, get } from 'lodash';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTabs,
  EuiTab,
  EuiLoadingSpinner,
  EuiSpacer,
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
  FeatureAggregationData,
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
  filterWithHeatmapFilter,
} from '../../utils/anomalyResultUtils';
import { AnomalyResultsTable } from './AnomalyResultsTable';
import { AnomaliesChart } from '../../AnomalyCharts/containers/AnomaliesChart';
import { FeatureBreakDown } from '../../AnomalyCharts/containers/FeatureBreakDown';
import { minuteDateFormatter } from '../../utils/helpers';
import { ANOMALY_HISTORY_TABS } from '../utils/constants';
import { MIN_IN_MILLI_SECS } from '../../../../server/utils/constants';
import { INITIAL_ANOMALY_SUMMARY } from '../../AnomalyCharts/utils/constants';
import { MAX_ANOMALIES } from '../../../utils/constants';
import {
  searchResults,
  getDetectorResults,
} from '../../../redux/reducers/anomalyResults';
import { AnomalyOccurrenceChart } from '../../AnomalyCharts/containers/AnomalyOccurrenceChart';
import { HeatmapCell } from '../../AnomalyCharts/containers/AnomalyHeatmapChart';
import { getAnomalyHistoryWording } from '../../AnomalyCharts/utils/anomalyChartUtils';
import { darkModeEnabled } from '../../../utils/kibanaUtils';

interface AnomalyHistoryProps {
  detector: Detector;
  monitor: Monitor | undefined;
  isFeatureDataMissing?: boolean;
  isHistorical?: boolean;
  taskId?: string;
  isNotSample?: boolean;
}

const useAsyncRef = (value: any) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

export const AnomalyHistory = (props: AnomalyHistoryProps) => {
  const dispatch = useDispatch();
  const taskId = useAsyncRef(props.taskId);
  const [isLoading, setIsLoading] = useState(false);
  const initialStartDate =
    props.isHistorical && props.detector?.detectionDateRange
      ? props.detector.detectionDateRange.startTime
      : moment().subtract(7, 'days').valueOf();
  const initialEndDate =
    props.isHistorical && props.detector?.detectionDateRange
      ? props.detector.detectionDateRange.endTime
      : moment().valueOf();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });
  const [zoomRange, setZoomRange] = useState<DateRange>({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });
  const [selectedTabId, setSelectedTabId] = useState<string>(
    ANOMALY_HISTORY_TABS.ANOMALY_OCCURRENCE
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

  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<HeatmapCell>();

  const detectorCategoryField = get(props.detector, 'categoryField', []);
  const isHCDetector = !isEmpty(detectorCategoryField);
  const backgroundColor = darkModeEnabled() ? '#29017' : '#F7F7F7';

  useEffect(() => {
    // We load at most 10k AD result data points for one call. If user choose
    // a big time range which may have more than 10k AD results, will use bucket
    // aggregation to load data points in whole time range with larger interval.
    async function getBucketizedAnomalyResults() {
      try {
        setIsLoadingAnomalyResults(true);
        const anomalySummaryResult = await dispatch(
          searchResults(
            getAnomalySummaryQuery(
              dateRange.startDate,
              dateRange.endDate,
              props.detector.id,
              props.isHistorical,
              taskId.current
            )
          )
        );

        setPureAnomalies(parsePureAnomalies(anomalySummaryResult));
        setBucketizedAnomalySummary(parseAnomalySummary(anomalySummaryResult));

        const result = await dispatch(
          searchResults(
            getBucketizedAnomalyResultsQuery(
              dateRange.startDate,
              dateRange.endDate,
              1,
              props.detector.id,
              props.isHistorical,
              taskId.current
            )
          )
        );

        setBucketizedAnomalyResults(parseBucketizedAnomalyResults(result));
      } catch (err) {
        console.error(
          `Failed to get anomaly results for ${props.detector?.id}`,
          err
        );
      } finally {
        setIsLoadingAnomalyResults(false);
      }
    }

    fetchRawAnomalyResults(isHCDetector);

    if (
      !isHCDetector &&
      dateRange.endDate - dateRange.startDate >
        detectorInterval * MIN_IN_MILLI_SECS * MAX_ANOMALIES
    ) {
      getBucketizedAnomalyResults();
    } else {
      setBucketizedAnomalyResults(undefined);
    }
  }, [dateRange, props.detector]);

  const detectorInterval = get(
    props.detector,
    'detectionInterval.period.interval',
    1
  );

  const fetchRawAnomalyResults = async (showLoading: boolean) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const params = buildParamsForGetAnomalyResultsWithDateRange(
        dateRange.startDate -
          // for non HC detector, rawData is used for feature missing check
          // which needs window offset for time range.
          // But it is not needed for HC detector
          (isHCDetector
            ? 0
            : FEATURE_DATA_CHECK_WINDOW_OFFSET *
              detectorInterval *
              MIN_IN_MILLI_SECS),
        dateRange.endDate,
        // get anomaly only data if HC detector
        isHCDetector
      );
      const detectorResultResponse = props.isHistorical
        ? await dispatch(getDetectorResults(taskId.current || '', params, true))
        : await dispatch(getDetectorResults(props.detector.id, params, false));
      const rawAnomaliesData = get(detectorResultResponse, 'response', []);
      const rawAnomaliesResult = {
        anomalies: get(rawAnomaliesData, 'results', []),
        featureData: get(rawAnomaliesData, 'featureResults', []),
      } as Anomalies;
      setAtomicAnomalyResults(rawAnomaliesResult);
      setRawAnomalyResults(rawAnomaliesResult);
      setHCDetectorAnomalyResults(getAnomalyResultForHC(rawAnomaliesResult));
    } catch (err) {
      console.error(
        `Failed to get atomic anomaly results for ${props.detector.id}`,
        err
      );
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  //TODO current implementation can bring in performance issue, will work issue below
  // https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/issues/313
  const getAnomalyResultForHC = (rawAnomalyResults: Anomalies) => {
    const resultAnomaly = rawAnomalyResults.anomalies.filter(
      (anomaly) => get(anomaly, 'anomalyGrade', 0) > 0
    );

    const anomaliesFeatureData = resultAnomaly.map(
      (anomaly) => anomaly.features
    );

    const resultAnomalyFeatureData: {
      [key: string]: FeatureAggregationData[];
    } = {};
    anomaliesFeatureData.forEach((anomalyFeatureData) => {
      if (anomalyFeatureData) {
        for (const [featureId, featureAggData] of Object.entries(
          anomalyFeatureData
        )) {
          if (!resultAnomalyFeatureData[featureId]) {
            resultAnomalyFeatureData[featureId] = [];
          }
          resultAnomalyFeatureData[featureId].push(featureAggData);
        }
      }
    });
    return {
      anomalies: resultAnomaly,
      featureData: resultAnomalyFeatureData,
    } as Anomalies;
  };

  const [atomicAnomalyResults, setAtomicAnomalyResults] = useState<Anomalies>();
  const [rawAnomalyResults, setRawAnomalyResults] = useState<Anomalies>();
  const [hcDetectorAnomalyResults, setHCDetectorAnomalyResults] = useState<
    Anomalies
  >();

  const anomalyResults = isHCDetector
    ? hcDetectorAnomalyResults
    : bucketizedAnomalyResults
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

  const handleHeatmapCellSelected = useCallback((heatmapCell: HeatmapCell) => {
    setSelectedHeatmapCell(heatmapCell);
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
          entity: get(anomaly, 'entity', []),
        }))
    : [];

  const tabs = [
    {
      id: ANOMALY_HISTORY_TABS.ANOMALY_OCCURRENCE,
      name: 'Anomaly occurrence',
      disabled: false,
    },
    {
      id: ANOMALY_HISTORY_TABS.FEATURE_BREAKDOWN,
      name: 'Feature breakdown',
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
        title={getAnomalyHistoryWording(true)}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onZoomRangeChange={handleZoomChange}
        bucketizedAnomalies={bucketizedAnomalyResults !== undefined}
        anomalySummary={bucketizedAnomalySummary}
        isLoading={isLoading || isLoadingAnomalyResults}
        showAlerts={props.isHistorical ? false : true}
        isNotSample={props.isNotSample}
        detector={props.detector}
        monitor={props.monitor}
        isHCDetector={isHCDetector}
        isHistorical={props.isHistorical}
        detectorCategoryField={detectorCategoryField}
        onHeatmapCellSelected={handleHeatmapCellSelected}
        selectedHeatmapCell={selectedHeatmapCell}
        anomaliesResult={anomalyResults}
      >
        <EuiTabs>{renderTabs()}</EuiTabs>

        {isLoading || isLoadingAnomalyResults ? (
          <EuiFlexGroup
            justifyContent="spaceAround"
            style={{ height: '500px', paddingTop: '100px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiLoadingSpinner size="xl" />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : (
          <div style={{ padding: '20px', backgroundColor: backgroundColor }}>
            {selectedTabId === ANOMALY_HISTORY_TABS.FEATURE_BREAKDOWN ? (
              <FeatureBreakDown
                detector={props.detector}
                // @ts-ignore
                anomaliesResult={anomalyResults}
                rawAnomalyResults={rawAnomalyResults}
                annotations={annotations}
                isLoading={isLoading}
                dateRange={zoomRange}
                featureDataSeriesName="Feature output"
                showFeatureMissingDataPointAnnotation={
                  props.detector.enabled &&
                  // disable showing missing feature alert when it is HC Detector
                  !isHCDetector
                }
                isFeatureDataMissing={props.isFeatureDataMissing}
                isHCDetector={isHCDetector}
                selectedHeatmapCell={selectedHeatmapCell}
              />
            ) : (
              [
                isHCDetector
                  ? [
                      <AnomalyOccurrenceChart
                        title={
                          selectedHeatmapCell
                            ? selectedHeatmapCell.entityValue
                            : '-'
                        }
                        dateRange={dateRange}
                        onDateRangeChange={handleDateRangeChange}
                        onZoomRangeChange={handleZoomChange}
                        anomalies={
                          anomalyResults ? anomalyResults.anomalies : []
                        }
                        bucketizedAnomalies={
                          bucketizedAnomalyResults !== undefined
                        }
                        anomalySummary={bucketizedAnomalySummary}
                        isLoading={isLoading || isLoadingAnomalyResults}
                        anomalyGradeSeriesName="Anomaly grade"
                        confidenceSeriesName="Confidence"
                        showAlerts={true}
                        isNotSample={true}
                        detector={props.detector}
                        monitor={props.monitor}
                        isHCDetector={isHCDetector}
                        selectedHeatmapCell={selectedHeatmapCell}
                      />,
                      <EuiSpacer size="m" />,
                    ]
                  : null,
                <AnomalyResultsTable
                  anomalies={filterWithHeatmapFilter(
                    bucketizedAnomalyResults === undefined
                      ? anomalyResults
                        ? filterWithDateRange(
                            anomalyResults.anomalies,
                            zoomRange,
                            'plotTime'
                          )
                        : []
                      : pureAnomalies,
                    selectedHeatmapCell,
                    true,
                    'plotTime'
                  )}
                  isHCDetector={isHCDetector}
                />,
              ]
            )}
          </div>
        )}
      </AnomaliesChart>
    </Fragment>
  );
};
