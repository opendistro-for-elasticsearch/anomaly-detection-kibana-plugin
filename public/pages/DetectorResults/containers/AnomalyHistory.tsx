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
import moment, { Moment } from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'public/redux/reducers';
import { AnomalyData, Detector, Monitor } from '../../../models/interfaces';
import { getAnomalyResultsWithDateRange } from '../utils/anomalyResultUtils';
import { TotalAnomaliesChart } from '../../PreviewDetector/components/AnomaliesChart/TotalAnomaliesChart';
import { get, isEmpty } from 'lodash';
import { FeatureAnomaliesChart } from '../../PreviewDetector/containers/FeatureAnomaliesChart';
import { AnomalyResultsTable } from './AnomalyResultsTable';

interface AnomalyHistoryProps {
  detectorId: string;
  detector: Detector;
  monitor: Monitor | undefined;
  createFeature(): void;
}

export const AnomalyHistory = (props: AnomalyHistoryProps) => {
  const dispatch = useDispatch();
  const isLoading = useSelector(
    (state: AppState) => state.anomalyResults.requesting
  );
  type AnomalyResultDateRange = {
    startDate: Moment;
    endDate: Moment;
  };
  const [dateRange, setDateRange] = useState<AnomalyResultDateRange>({
    startDate: moment().subtract(1, 'hours'),
    endDate: moment(),
  });
  const [dateRangeOption, setDateRangeOption] = useState<string>('last_1_hour');
  const [selectedTabId, setSelectedTabId] = useState<string>(
    'featureBreakdown'
  );

  useEffect(() => {
    getAnomalyResultsWithDateRange(
      dispatch,
      dateRange.startDate,
      dateRange.endDate,
      props.detectorId
    );
  }, [dateRange]);

  const anomalyResults = useSelector((state: AppState) => state.anomalyResults);

  const handleDateRangeChange = useCallback(
    (startDate: Moment, endDate: Moment, dateRangeOption: string) => {
      setDateRange({
        startDate,
        endDate,
      });
      setDateRangeOption(dateRangeOption);
    },
    []
  );

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
      } between ${moment(anomaly.startTime).format(
        'MM/DD/YY h:mm a'
      )} and ${moment(anomaly.endTime).format('MM/DD/YY h:mm a')}`,
    }));

  const tabs = [
    {
      id: 'featureBreakdown',
      name: 'Feature breakdown',
      disabled: false,
    },
    {
      id: 'anomalyOccurrence',
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
      <TotalAnomaliesChart
        title="Anomaly history"
        onDateRangeChange={handleDateRangeChange}
        anomalies={anomalyResults.anomalies}
        isLoading={isLoading}
        startDateTime={dateRange.startDate}
        endDateTime={moment()}
        // annotations={annotations}
        anomalyGradeSeriesName="Anomaly grade"
        confidenceSeriesName="Confidence"
        dateRangeOption={dateRangeOption}
        showAlerts={true}
        detectorId={props.detectorId}
        detectorName={props.detector.name}
        detector={props.detector}
        detectorInterval={props.detector.detectionInterval.period.interval}
        unit={props.detector.detectionInterval.period.unit}
        monitor={props.monitor}
        noFeature={isEmpty(props.detector.featureAttributes)}
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
            <FeatureAnomaliesChart
              detector={props.detector}
              onEdit={() => alert('edit')}
              featureEditId={''}
              // @ts-ignore
              anomaliesResult={anomalyResults}
              annotations={annotations}
              onUpdatePreview={() => alert('update preview')}
              isLoading={isLoading}
              onCreateFeature={props.createFeature}
              startDateTime={dateRange.startDate}
              endDateTime={moment()}
              featureDataSeriesName="Feature output"
              featureAnomalyAnnotationSeriesName="Anomaly occurrence"
              showAnomalyAsBar={true}
            />
          ) : (
            <AnomalyResultsTable anomalies={anomalyResults.anomalies} />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};
