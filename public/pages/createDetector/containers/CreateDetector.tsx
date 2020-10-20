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

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { Formik } from 'formik';
import { get, isEmpty } from 'lodash';
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';
//@ts-ignore
import chrome from 'ui/chrome';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import { APIAction } from '../../../redux/middleware/types';
import {
  createDetector,
  searchDetector,
  updateDetector,
} from '../../../redux/reducers/ad';
import { getIndices } from '../../../redux/reducers/elasticsearch';
import { AppState } from '../../../redux/reducers';
import { BREADCRUMBS, MAX_DETECTORS } from '../../../utils/constants';
import { getErrorMessage, validateDetectorName } from '../../../utils/utils';
import { DetectorInfo } from '../components/DetectorInfo';
import { useFetchDetectorInfo } from '../hooks/useFetchDetectorInfo';
import { DataSource } from './DataSource/index';
import { ADFormikValues } from './models/interfaces';
import { detectorToFormik } from './utils/detectorToFormik';
import { formikToDetector } from './utils/formikToDetector';
import { Detector } from '../../../models/interfaces';
import { Settings } from '../components/Settings/Settings';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { CatIndex } from '../../../../server/models/types';
import { SampleDataCallout } from '../../SampleData/components/SampleDataCallout/SampleDataCallout';
import { containsDetectorsIndex } from '../../SampleData/utils/helpers';
import { clearModelConfiguration } from './utils/helpers';
import { prettifyErrorMessage } from '../../../../server/utils/helpers';

interface CreateRouterProps {
  detectorId?: string;
}

interface CreateADProps extends RouteComponentProps<CreateRouterProps> {
  isEdit: boolean;
}

export function CreateDetector(props: CreateADProps) {
  useHideSideNavBar(true, false);
  const dispatch = useDispatch<Dispatch<APIAction>>();
  const detectorId: string = get(props, 'match.params.detectorId', '');
  //In case user is refreshing Edit detector page, we'll lose existing detector state
  //This will ensure to fetch the detector based on id from URL
  const { detector, hasError } = useFetchDetectorInfo(detectorId);
  const [sampleCalloutVisible, setSampleCalloutVisible] = useState<boolean>(
    false
  );
  const visibleIndices = useSelector(
    (state: AppState) => state.elasticsearch.indices
  ) as CatIndex[];
  const [newIndexSelected, setNewIndexSelected] = useState<boolean>(false);

  // Getting all initial indices
  useEffect(() => {
    const getInitialIndices = async () => {
      await dispatch(getIndices(''));
    };
    getInitialIndices();
  }, []);

  // Check if the sample data callout should be visible based on detector index
  useEffect(() => {
    setSampleCalloutVisible(!containsDetectorsIndex(visibleIndices));
  }, [visibleIndices]);

  //Set breadcrumbs based on Create / Update
  useEffect(() => {
    const createOrEditBreadcrumb = props.isEdit
      ? BREADCRUMBS.EDIT_DETECTOR
      : BREADCRUMBS.CREATE_DETECTOR;
    let breadCrumbs = [
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      createOrEditBreadcrumb,
    ];
    if (detector && detector.name) {
      breadCrumbs.splice(2, 0, {
        text: detector.name,
        //@ts-ignore
        href: `#/detectors/${detectorId}`,
      });
    }
    chrome.breadcrumbs.set(breadCrumbs);
  });
  // If no detector found with ID, redirect it to list
  useEffect(() => {
    if (props.isEdit && hasError) {
      toastNotifications.addDanger('Unable to find detector for edit');
      props.history.push(`/detectors`);
    }
  }, [props.isEdit]);

  const handleUpdate = async (detectorToBeUpdated: Detector) => {
    try {
      // If a new index was selected: clear any existing features and category fields
      const preparedDetector = newIndexSelected
        ? clearModelConfiguration(detectorToBeUpdated)
        : detectorToBeUpdated;
      await dispatch(updateDetector(detectorId, preparedDetector));
      toastNotifications.addSuccess(
        `Detector updated: ${preparedDetector.name}`
      );
      props.history.push(`/detectors/${detectorId}/configurations/`);
    } catch (err) {
      toastNotifications.addDanger(
        prettifyErrorMessage(
          getErrorMessage(err, 'There was a problem updating detector')
        )
      );
    }
  };
  const handleCreate = async (detectorToBeCreated: Detector) => {
    try {
      const detectorResp = await dispatch(createDetector(detectorToBeCreated));
      toastNotifications.addSuccess(
        `Detector created: ${detectorToBeCreated.name}`
      );
      props.history.push(
        `/detectors/${detectorResp.data.response.id}/configurations/`
      );
    } catch (err) {
      const resp = await dispatch(
        searchDetector({
          query: { bool: { must_not: { match: { name: '' } } } },
        })
      );
      const totalDetectors = resp.data.response.totalDetectors;
      if (totalDetectors === MAX_DETECTORS) {
        toastNotifications.addDanger(
          'Cannot create detector - limit of ' +
            MAX_DETECTORS +
            ' detectors reached'
        );
      } else {
        toastNotifications.addDanger(
          prettifyErrorMessage(
            getErrorMessage(err, 'There was a problem creating detector')
          )
        );
      }
    }
  };

  const handleSubmit = async (values: ADFormikValues, formikBag: any) => {
    const apiRequest = formikToDetector(values, detector);
    try {
      if (props.isEdit) {
        await handleUpdate(apiRequest);
      } else {
        await handleCreate(apiRequest);
      }
      formikBag.setSubmitting(false);
    } catch (e) {
      formikBag.setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    detectorId
      ? props.history.push(`/detectors/${detectorId}/configurations`)
      : props.history.push('/detectors');
  };

  const handleValidateName = async (detectorName: string) => {
    const {
      isEdit,
      match: {
        params: { detectorId },
      },
    } = props;
    if (isEmpty(detectorName)) {
      throw 'Detector name cannot be empty';
    } else {
      const error = validateDetectorName(detectorName);
      if (error) {
        throw error;
      }
      //TODO::Avoid making call if value is same
      const resp = await dispatch(
        searchDetector({ query: { term: { 'name.keyword': detectorName } } })
      );
      const totalDetectors = resp.data.response.totalDetectors;
      if (totalDetectors === 0) {
        return undefined;
      }
      //If more than one detectors found, duplicate exists.
      if (!isEdit && totalDetectors > 0) {
        throw 'Duplicate detector name';
      }
      // if it is in edit mode
      if (
        isEdit &&
        (totalDetectors > 1 ||
          get(resp, 'data.response.detectors.0.id', '') !== detectorId)
      ) {
        throw 'Duplicate detector name';
      }
    }
  };

  const handleHideSampleCallout = () => {
    setSampleCalloutVisible(false);
  };

  return (
    <EuiPage>
      <EuiPageBody>
        {sampleCalloutVisible ? (
          <EuiFlexGroup direction="column" gutterSize="none">
            <EuiFlexItem>
              <SampleDataCallout onHide={handleHideSampleCallout} />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiSpacer size="m" />
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : null}
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>{props.isEdit ? 'Edit detector' : 'Create detector'} </h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>
        <Formik
          enableReinitialize={true}
          initialValues={detectorToFormik(detector)}
          onSubmit={handleSubmit}
        >
          {(formikProps) => (
            <Fragment>
              <DetectorInfo onValidateDetectorName={handleValidateName} />
              <EuiSpacer />
              <DataSource
                formikProps={formikProps}
                origIndex={props.isEdit ? get(detector, 'indices.0', '') : null}
                setNewIndexSelected={setNewIndexSelected}
                isEdit={props.isEdit}
              />
              <EuiSpacer />
              <Settings />
              <EuiSpacer />
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={handleCancelClick}>
                    Cancel
                  </EuiButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    type="submit"
                    isLoading={formikProps.isSubmitting}
                    //@ts-ignore
                    onClick={formikProps.handleSubmit}
                  >
                    {props.isEdit ? 'Save changes' : 'Create'}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          )}
        </Formik>
      </EuiPageBody>
    </EuiPage>
  );
}
