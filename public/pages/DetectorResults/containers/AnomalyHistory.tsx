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
  EuiSpacer,
  EuiTabs,
  EuiTab,
  EuiLoadingSpinner,
} from '@elastic/eui';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'public/redux/reducers';
import {
  AnomalyData,
  Detector,
  Monitor,
  DateRange,
} from '../../../models/interfaces';
import {
  getAnomalyResultsWithDateRange,
  filterWithDateRange,
} from '../../utils/anomalyResultUtils';
import { get } from 'lodash';
import { AnomalyResultsTable } from './AnomalyResultsTable';
import { AnomaliesChart } from '../../AnomalyCharts/containers/AnomaliesChart';
import { FeatureBreakDown } from '../../AnomalyCharts/containers/FeatureBreakDown';
import { minuteDateFormatter } from '../../utils/helpers';
import { ANOMALY_HISTORY_TABS } from '../utils/constants';

interface AnomalyHistoryProps {
  detector: Detector;
  monitor: Monitor | undefined;
  createFeature(): void;
}

export const AnomalyHistory = (props: AnomalyHistoryProps) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(
    (state: AppState) => state.anomalyResults.requesting
  );
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

  useEffect(() => {
    getAnomalyResultsWithDateRange(
      dispatch,
      dateRange.startDate,
      dateRange.endDate,
      props.detector.id
    );
  }, [dateRange]);

  const anomalyResults = useSelector((state: AppState) => state.anomalyResults);

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

  const annotations = get(anomalyResults, 'anomalies', [])
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
    }));

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
        anomalies={anomalyResults.anomalies}
        isLoading={isLoading}
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
      />
      <EuiTabs>{renderTabs()}</EuiTabs>
      <EuiSpacer />

      {isLoading ? (
        <EuiFlexGroup
          justifyContent="spaceAround"
          style={{ height: '200px', paddingTop: '100px' }}
        >
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        <Fragment>
          {selectedTabId === 'featureBreakdown' ? (
            <FeatureBreakDown
              detector={props.detector}
              // @ts-ignore
              anomaliesResult={anomalyResults}
              annotations={annotations}
              isLoading={isLoading}
              dateRange={zoomRange}
              featureDataSeriesName="Feature output"
            />
          ) : (
            <AnomalyResultsTable
              anomalies={filterWithDateRange(
                anomalyResults.anomalies,
                zoomRange,
                'plotTime'
              )}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};
