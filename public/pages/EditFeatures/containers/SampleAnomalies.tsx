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

import {
  EuiPageBody,
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiLink,
  EuiPage,
  EuiButton,
  EuiCallOut,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiIcon,
} from '@elastic/eui';
import moment, { Moment } from 'moment';
import { get } from 'lodash';
import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { previewDetector } from '../../../redux/reducers/anomalies';
import { AppState } from '../../../redux/reducers';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { Detector, DateRange } from '../../../models/interfaces';
import {
  FeaturesFormikValues,
  prepareDetector,
} from './utils/formikToFeatures';
import { AnomaliesChart } from '../../AnomalyCharts/containers/AnomaliesChart';
import { FeatureBreakDown } from '../../AnomalyCharts/containers/FeatureBreakDown';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { AD_RESULT_DATE_RANGES } from '../../utils/constants';
import { generateAnomalyAnnotations } from '../../utils/anomalyResultUtils';
import { SAMPLE_ANOMALY_DATE_RANGE_OPTIONS } from '../../AnomalyCharts/utils/anomalyChartUtils';

interface SampleAnomaliesProps {
  detector: Detector;
  featureList: FeaturesFormikValues[];
  errors: any;
}

export function SampleAnomalies(props: SampleAnomaliesProps) {
  const dispatch = useDispatch();
  useHideSideNavBar(true, false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewDone, setPreviewDone] = useState<boolean>(false);
  const [firstPreview, setFirstPreview] = useState<boolean>(true);
  const [newDetector, setNewDetector] = useState<Detector>(props.detector);
  const [previewDateRangeOption, setPreviewDateRangeOption] = useState<
    AD_RESULT_DATE_RANGES
  >(AD_RESULT_DATE_RANGES.LAST_7_DAYS);

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment().subtract(7, 'days'),
    endDate: moment(),
  });

  useEffect(() => {
    if (!firstPreview) {
      getSampleAnomalies();
    }
  }, [dateRange]);

  const handleDateRangeChange = useCallback(
    (startDate: Moment, endDate: Moment, dateRangeOption: string) => {
      setDateRange({
        startDate: startDate,
        endDate: endDate,
      });
      setPreviewDateRangeOption(dateRangeOption as AD_RESULT_DATE_RANGES);
    },
    []
  );

  const anomaliesResult = useSelector(
    (state: AppState) => state.anomalies.anomaliesResult
  );

  async function getSampleAdResult(detector: Detector) {
    try {
      setIsLoading(true);
      await dispatch(
        previewDetector(detector.id, {
          periodStart: dateRange.startDate.valueOf(),
          periodEnd: dateRange.endDate.valueOf(),
          detector: detector,
        })
      );
      setIsLoading(false);
      setPreviewDone(true);
      setFirstPreview(false);
    } catch (err) {
      console.error(`Fail to preivew detector ${detector.id}`, err);
      setIsLoading(false);
    }
  }

  const getSampleAnomalies = () => {
    try {
      const updatedDetector = prepareDetector(
        props.featureList,
        newDetector,
        true
      );
      setPreviewDone(false);
      setNewDetector(updatedDetector);
      getSampleAdResult(updatedDetector);
    } catch (err) {
      console.error(
        `Fail to get sample anomalies for detector ${newDetector.id}`,
        err
      );
    }
  };

  return (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel
          title="Sample anomalies"
          subTitle={
            <EuiText size="s">
              <p className="content-panel-subtitle">
                Preview how your anomalies may look like from sample feature
                output and adjust the feature settings as needed.{' '}
                <EuiLink
                  href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
                  target="_blank"
                >
                  Learn more
                  <EuiIcon size="s" type="popout" />
                </EuiLink>
              </p>
            </EuiText>
          }
        >
          {isLoading ? (
            <EuiLoadingSpinner size="l" />
          ) : (
            <EuiCallOut
              title={'You can preview anomalies based on sample feature input'}
              iconType="eye"
            >
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiText>
                    {firstPreview
                      ? 'You can preview how your anomalies may look like from sample feature output and adjust the feature settings as needed.'
                      : 'Use sample data as a reference to fine tune settings. Click "Refresh" if you makes any adjustment to see latest preview. Once you are done with edits, save changes and run detector to see real time and accurate anomalies based on your full data set'}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    type="submit"
                    data-test-subj="previewDetector"
                    onClick={() => getSampleAnomalies()}
                    disabled={
                      !!get(props.errors, 'featureList', []).find(
                        // @ts-ignore
                        featureError => !!featureError
                      ) || props.featureList.length === 0
                    }
                    fill={!firstPreview}
                  >
                    {firstPreview ? 'Preview anomalies' : 'Refresh'}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiCallOut>
          )}
          <EuiSpacer />
          {previewDone && !anomaliesResult.anomalies.length ? (
            <EuiCallOut
              title={
                'No sample anomaly result generated. Please check detector interval and make sure you have >400 data points during preview date range'
              }
              color="warning"
              iconType="alert"
            ></EuiCallOut>
          ) : null}
          {previewDone ? (
            <Fragment>
              <AnomaliesChart
                title="Sample anomaly history"
                onDateRangeChange={handleDateRangeChange}
                anomalies={anomaliesResult.anomalies}
                isLoading={false}
                dateRange={dateRange}
                anomalyGradeSeriesName="Sample anomaly grade"
                confidenceSeriesName="Sample confidence"
                initialDateRangeOption={previewDateRangeOption}
                dateRangeOptions={SAMPLE_ANOMALY_DATE_RANGE_OPTIONS}
                detectorId={props.detector.id}
                detectorName={props.detector.name}
              />
              <EuiSpacer />
              <FeatureBreakDown
                title="Sample feature breakdown"
                detector={newDetector}
                anomaliesResult={anomaliesResult}
                annotations={generateAnomalyAnnotations(
                  get(anomaliesResult, 'anomalies', [])
                )}
                isLoading={false} //TODO: add loading state
                dateRange={dateRange}
                featureDataSeriesName="Sample feature output"
              />
            </Fragment>
          ) : null}
        </ContentPanel>
      </EuiPageBody>
    </EuiPage>
  );
}
