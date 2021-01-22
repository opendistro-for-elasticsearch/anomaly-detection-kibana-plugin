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
  EuiButton,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiLoadingSpinner,
  EuiPage,
  EuiPageBody,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import {
  getAnomalyHistoryWording,
  getFeatureBreakdownWording,
  getFeatureDataWording,
} from '../../AnomalyCharts/utils/anomalyChartUtils';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { DateRange, Detector } from '../../../models/interfaces';
import { AppState } from '../../../redux/reducers';
import { previewDetector } from '../../../redux/reducers/previewAnomalies';
import { AnomaliesChart } from '../../AnomalyCharts/containers/AnomaliesChart';
import { HeatmapCell } from '../../AnomalyCharts/containers/AnomalyHeatmapChart';
import { FeatureBreakDown } from '../../AnomalyCharts/containers/FeatureBreakDown';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { generateAnomalyAnnotations } from '../../utils/anomalyResultUtils';
import { focusOnFirstWrongFeature } from '../utils/helpers';
import {
  FeaturesFormikValues,
  prepareDetector,
} from './utils/formikToFeatures';
import { prettifyErrorMessage } from '../../../../server/utils/helpers';
import { CoreStart } from '../../../../../../src/core/public';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';

interface SampleAnomaliesProps {
  detector: Detector;
  featureList: FeaturesFormikValues[];
  shingleSize: number;
  categoryFields: string[];
  errors: any;
  setFieldTouched: any;
}

export function SampleAnomalies(props: SampleAnomaliesProps) {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const dispatch = useDispatch();
  useHideSideNavBar(true, false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewDone, setPreviewDone] = useState<boolean>(false);
  const [firstPreview, setFirstPreview] = useState<boolean>(true);
  const [newDetector, setNewDetector] = useState<Detector>(props.detector);
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

  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<HeatmapCell>();

  const isHCDetector = !isEmpty(get(newDetector, 'categoryField', []));

  useEffect(() => {
    if (!firstPreview) {
      getSampleAnomalies();
    }
  }, [dateRange]);

  const handleDateRangeChange = useCallback(
    (startDate: number, endDate: number, dateRangeOption: string) => {
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

  const anomaliesResult = useSelector(
    (state: AppState) => state.anomalies.anomaliesResult
  );

  const getPreviewErrorMessage = (err: any, defaultMessage: string) => {
    if (typeof err === 'string') return err;
    if (err) {
      if (err.msg === 'Bad Request') {
        return err.response || defaultMessage;
      }
      if (err.msg) return err.msg;
    }
    return defaultMessage;
  };

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
      console.error(`Fail to preview detector ${detector.id}`, err);
      setIsLoading(false);
      core.notifications.toasts.addDanger(
        prettifyErrorMessage(
          getPreviewErrorMessage(
            err,
            'There was a problem previewing the detector'
          )
        )
      );
    }
  }

  const getSampleAnomalies = () => {
    setSelectedHeatmapCell(undefined);
    try {
      const updatedDetector = prepareDetector(
        props.featureList,
        props.shingleSize,
        props.categoryFields,
        newDetector,
        true
      );
      setPreviewDone(false);
      setZoomRange({ ...dateRange });
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
        <ContentPanel title="Sample anomalies">
          <EuiCallOut
            title={'You can preview anomalies based on sample feature input'}
            iconType="eye"
          >
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiText>
                  {firstPreview
                    ? 'You can preview how your anomalies may look like from sample feature output and adjust the feature settings as needed.'
                    : 'Use the sample data as a reference to fine tune settings. To see the latest preview with your adjustments, click "Refresh preview". Once you are done with your edits, save your changes and run the detector to see real time anomalies for the new data set.'}{' '}
                  <EuiLink
                    href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
                    target="_blank"
                  >
                    Learn more <EuiIcon size="s" type="popout" />
                  </EuiLink>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiButton
                  type="button"
                  data-test-subj="previewDetector"
                  onClick={() => {
                    if (
                      !focusOnFirstWrongFeature(
                        props.errors,
                        props.setFieldTouched
                      )
                    ) {
                      getSampleAnomalies();
                    }
                  }}
                  fill={!firstPreview}
                  isLoading={isLoading}
                >
                  {firstPreview ? 'Preview anomalies' : 'Refresh preview'}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiCallOut>
          <EuiSpacer />
          {previewDone && !anomaliesResult.anomalies.length ? (
            <EuiCallOut
              title={`No sample anomaly result generated. Please check detector interval and make sure you have >400 data points${
                isHCDetector ? ' for some entities ' : ' '
              }during preview date range`}
              color="warning"
              iconType="alert"
            ></EuiCallOut>
          ) : null}
          {!firstPreview ? (
            <Fragment>
              <AnomaliesChart
                title={getAnomalyHistoryWording(false)}
                onDateRangeChange={handleDateRangeChange}
                onZoomRangeChange={handleZoomChange}
                isLoading={isLoading}
                dateRange={dateRange}
                detector={props.detector}
                isHCDetector={isHCDetector}
                detectorCategoryField={newDetector.categoryField}
                onHeatmapCellSelected={handleHeatmapCellSelected}
                selectedHeatmapCell={selectedHeatmapCell}
                newDetector={newDetector}
                zoomRange={zoomRange}
                anomaliesResult={anomaliesResult}
                showAlerts={false}
                isNotSample={false}
              />
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
              ) : isHCDetector ? null : (
                <FeatureBreakDown
                  title={getFeatureBreakdownWording(false)}
                  detector={newDetector}
                  anomaliesResult={anomaliesResult}
                  annotations={generateAnomalyAnnotations(
                    get(anomaliesResult, 'anomalies', [])
                  )}
                  isLoading={isLoading}
                  dateRange={zoomRange}
                  featureDataSeriesName={getFeatureDataWording(false)}
                />
              )}
            </Fragment>
          ) : null}
        </ContentPanel>
      </EuiPageBody>
    </EuiPage>
  );
}
