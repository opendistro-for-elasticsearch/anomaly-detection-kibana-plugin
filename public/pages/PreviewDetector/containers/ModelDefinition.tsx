/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cloneDeep, get } from 'lodash';
import moment, { Moment } from 'moment';
import { useDispatch, useSelector } from 'react-redux';
//@ts-ignore
import chrome from 'ui/chrome';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSpacer,
  EuiTitle,
  EuiConfirmModal,
  EuiOverlayMask,
  EUI_MODAL_CANCEL_BUTTON,
} from '@elastic/eui';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { AdjustModel } from './AdjustModel';
import { CreateFeature } from './CreateFeature';
import { FeatureDetails } from './Features';
import { INITIAL_VALUES } from './utils/constants';
import { featuresToFormik } from './utils/featuresToFormik';
import { AnomaliesChart } from '../components/AnomaliesChart';
import { FeatureControls } from '../components/FeaturesControls';
import { useSticky } from '../../../hooks/useSticky';
import { Detector, AnomalyData } from '../../../models/interfaces';
import { AppState } from '../../../redux/reducers';
import { previewDetector } from '../../../redux/reducers/anomalies';
import { deleteDetector } from '../../../redux/reducers/ad';
import { getErrorMessage } from '../../../utils/utils';
import { RouteComponentProps } from 'react-router';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import { BREADCRUMBS } from '../../../utils/constants';

interface ModelDefinitionProps extends RouteComponentProps {
  detectorId: string;
  detector: Detector;
}

export type ModelDefinitionRangeState = {
  startDate: Moment;
  endDate: Moment;
};

const FLY_OUTS = {
  NONE: '',
  TUNE_MODEL: 'tune_model',
  FEATURE_EDITOR: 'feature_editor',
};

const stickyStyles = {
  position: 'fixed',
  top: 48,
  left: 48,
  right: 0,
  zIndex: 999999,
  boxShadow: '0 3px 5px rgba(57, 63, 72, 0.3)',
};

const KIBANA_HEADER_OFFSET = 48;

const getContainerCss = (darkMode: boolean) => {
  const commonStyles = {
    transition: 'margin-right 250ms',
    padding: '15px 25px',
    height: '100%',
  };
  if (darkMode) {
    return commonStyles;
  } else {
    return {
      ...commonStyles,
      backgroundColor: '#F6F6F6',
    };
  }
};

export const ModelDefinition = (props: ModelDefinitionProps) => {
  const dispatch = useDispatch();
  const [flyoutBody, setFlyOutBody] = useState<string>(FLY_OUTS.NONE);
  const [featureToEdit, setFeatureEdit] = useState<string>('');
  const [showDeleteConfirmation, setDeleteConfirmation] = useState<boolean>(
    false
  );
  useEffect(() => {
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DASHBOARD,
      { text: props.detector.name || '' },
      BREADCRUMBS.MODEL_DEFINITION,
    ]);
  });
  let timeout = 0;
  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(handleScroll);
    });
    return () => {
      window.cancelAnimationFrame(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  //Initial start days 5
  const [dateRange, setDateRange] = useState<ModelDefinitionRangeState>({
    startDate: moment().subtract(5, 'days'),
    endDate: moment(),
  });
  const anomaliesResult = useSelector(
    (state: AppState) => state.anomalies.anomaliesResult
  );
  const isPreviewUpdating = useSelector(
    (state: AppState) => state.anomalies.requesting
  );
  const stickyRef = useRef<HTMLDivElement>(null);
  const isSticky = useSticky(stickyRef, KIBANA_HEADER_OFFSET);
  const [topOffset, setTopOffset] = useState<number>(0);

  const handleScroll = () => {
    setTopOffset(window.pageYOffset);
  };

  const handleUpdatePreview = useCallback(
    async () => {
      if (!isPreviewUpdating) {
        try {
          await dispatch(
            previewDetector(props.detectorId, {
              periodStart: dateRange.startDate.valueOf(),
              periodEnd: dateRange.endDate.valueOf(),
            })
          );
        } catch (err) {
          console.log('Unable to get preview');
        }
      }
    },
    [isPreviewUpdating, dateRange.startDate, dateRange.endDate]
  );

  const handleDateRangeChange = useCallback(
    (startDate: Moment, endDate: Moment) => {
      setDateRange({
        startDate,
        endDate,
      });
    },
    []
  );

  const handleEdit = useCallback(
    (
      ev: React.MouseEvent<HTMLButtonElement, MouseEvent>,
      featureId: string
    ) => {
      if (!flyoutBody) {
        setFlyOutBody(FLY_OUTS.FEATURE_EDITOR);
      }
      setFeatureEdit(featureId);
    },
    [isPreviewUpdating]
  );

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(deleteDetector(props.detectorId));
      toastNotifications.addSuccess(`Detector has been deleted successfully`);
      setDeleteConfirmation(false);
      props.history.push('/detectors');
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem deleting detector')
      );
      setDeleteConfirmation(false);
    }
  }, []);

  const handleOnCreate = useCallback(() => {
    setFlyOutBody(FLY_OUTS.FEATURE_EDITOR);
  }, []);

  const handleOFlyoutClose = useCallback(() => {
    setFlyOutBody(FLY_OUTS.NONE);
    setFeatureEdit('');
  }, []);

  //Initial load
  useEffect(
    () => {
      handleUpdatePreview();
    },
    [dateRange.startDate.valueOf(), dateRange.endDate.valueOf()]
  );
  const isDarkMode = darkModeEnabled();
  //@ts-ignore
  const annotations = get(anomaliesResult, 'anomalies', [])
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
  const stickyCss = isSticky ? { ...stickyStyles } : {};
  const darkModeContainerCss = isDarkMode
    ? { backgroundColor: '#1D1E24' }
    : { backgroundColor: '#fff' };
  return (
    <React.Fragment>
      <div
        style={{ padding: '10px 25px', ...darkModeContainerCss, ...stickyCss }}
        ref={stickyRef}
      >
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>Model definitions</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem>
                <FeatureControls
                  onCreateFeature={handleOnCreate}
                  onDelete={() => setDeleteConfirmation(true)}
                  onAdjustModel={() => setFlyOutBody(FLY_OUTS.TUNE_MODEL)}
                  detectorId={props.detectorId}
                  detectorName={props.detector.name}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
      <EuiHorizontalRule margin="none" />
      {stickyRef && isSticky ? (
        <div style={{ height: get(stickyRef, 'current.clientHeight', 0) }} />
      ) : null}
      <div
        style={
          flyoutBody
            ? {
                ...getContainerCss(isDarkMode),
                marginRight: '424px',
              }
            : {
                ...getContainerCss(isDarkMode),
                marginRight: '0px',
              }
        }
      >
        <AnomaliesChart
          onDateRangeChange={handleDateRangeChange}
          anomalies={anomaliesResult.anomalies}
          isLoading={isPreviewUpdating}
          startDateTime={dateRange.startDate}
          endDateTime={dateRange.endDate}
          annotations={annotations}
        />
        <EuiSpacer />
        <FeatureDetails
          detector={props.detector}
          onEdit={handleEdit}
          featureEditId={featureToEdit}
          anomaliesResult={anomaliesResult}
          annotations={annotations}
          onUpdatePreview={handleUpdatePreview}
          isLoading={isPreviewUpdating}
          onCreateFeature={handleOnCreate}
          startDateTime={dateRange.startDate}
          endDateTime={dateRange.endDate}
        />
      </div>
      {flyoutBody === FLY_OUTS.TUNE_MODEL ? (
        <AdjustModel
          topOffset={topOffset}
          detector={props.detector}
          onClose={handleOFlyoutClose}
          onUpdatePreview={handleUpdatePreview}
          isSticky={isSticky}
        />
      ) : null}
      {flyoutBody === FLY_OUTS.FEATURE_EDITOR ? (
        <CreateFeature
          isSticky={isSticky}
          topOffset={topOffset}
          detector={props.detector}
          featureToEdit={featureToEdit}
          initialValues={get(
            featuresToFormik(props.detector),
            `${featureToEdit}`,
            cloneDeep(INITIAL_VALUES)
          )}
          onClose={handleOFlyoutClose}
          featureAttributes={get(props, 'detector.featureAttributes', [])}
          onUpdatePreview={handleUpdatePreview}
        />
      ) : null}
      {showDeleteConfirmation ? (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="Delete this detector?"
            onCancel={() => setDeleteConfirmation(false)}
            onConfirm={handleDelete}
            cancelButtonText="No"
            confirmButtonText="Yes"
            buttonColor="danger"
            defaultFocusedButton={EUI_MODAL_CANCEL_BUTTON}
          />
        </EuiOverlayMask>
      ) : null}
    </React.Fragment>
  );
};
