/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiFlexItem,
  EuiFlexGroup,
  EuiPage,
  EuiButton,
  EuiTitle,
  EuiButtonEmpty,
  EuiSpacer,
} from '@elastic/eui';
import { FormikProps, Formik } from 'formik';
import { get, isEmpty } from 'lodash';
import React, { Fragment, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { AppState } from '../../../redux/reducers';
import { getMappings } from '../../../redux/reducers/elasticsearch';
import { useFetchDetectorInfo } from '../../CreateDetectorSteps/hooks/useFetchDetectorInfo';
import { BREADCRUMBS } from '../../../utils/constants';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { updateDetector } from '../../../redux/reducers/ad';
import {
  validateFeatures,
  focusOnFirstWrongFeature,
  getCategoryFields,
  focusOnCategoryField,
  getShingleSizeFromObject,
  modelConfigurationToFormik,
} from '../utils/helpers';
import { formikToDetector } from '../../ReviewAndCreate/utils/helpers';
import { formikToModelConfiguration } from '../utils/helpers';
import { Features } from '../components/Features';
import { CategoryField } from '../components/CategoryField';
import { AdvancedSettings } from '../components/AdvancedSettings';
import { SampleAnomalies } from './SampleAnomalies';
import { CoreStart } from '../../../../../../src/core/public';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';
import { Detector } from '../../../models/interfaces';
import { prettifyErrorMessage } from '../../../../server/utils/helpers';
import { DetectorDefinitionFormikValues } from '../../DefineDetector/models/interfaces';
import { ModelConfigurationFormikValues } from '../models/interfaces';
import { CreateDetectorFormikValues } from '../../CreateDetectorSteps/models/interfaces';
import { DETECTOR_STATE } from '../../../../server/utils/constants';
import { getErrorMessage } from '../../../utils/utils';

interface ConfigureModelRouterProps {
  detectorId?: string;
}

interface ConfigureModelProps
  extends RouteComponentProps<ConfigureModelRouterProps> {
  isEdit: boolean;
  setStep?(stepNumber: number): void;
  initialValues?: ModelConfigurationFormikValues;
  setInitialValues?(initialValues: ModelConfigurationFormikValues): void;
  detectorDefinitionValues?: DetectorDefinitionFormikValues;
}

export function ConfigureModel(props: ConfigureModelProps) {
  const core = React.useContext(CoreServicesContext) as CoreStart;
  const dispatch = useDispatch();
  useHideSideNavBar(true, false);
  const detectorId = get(props, 'match.params.detectorId', '');
  const { detector, hasError } = useFetchDetectorInfo(detectorId);
  const indexDataTypes = useSelector(
    (state: AppState) => state.elasticsearch.dataTypes
  );
  const [isHCDetector, setIsHCDetector] = useState<boolean>(
    props.initialValues ? props.initialValues.categoryFieldEnabled : false
  );
  const isLoading = useSelector(
    (state: AppState) => state.elasticsearch.requesting
  );
  const originalShingleSize = getShingleSizeFromObject(detector, isHCDetector);

  // Jump to top of page on first load
  useEffect(() => {
    scroll(0, 0);
  }, []);

  // When detector is loaded: get any category fields (if applicable) and
  // get all index mappings based on detector's selected index
  useEffect(() => {
    if (detector && get(detector, 'categoryField', []).length > 0) {
      setIsHCDetector(true);
    }
    if (detector?.indices) {
      dispatch(getMappings(detector.indices[0]));
    }
  }, [detector]);

  useEffect(() => {
    if (props.isEdit) {
      core.chrome.setBreadcrumbs([
        BREADCRUMBS.ANOMALY_DETECTOR,
        BREADCRUMBS.DETECTORS,
        {
          text: detector && detector.name ? detector.name : '',
          href: `#/detectors/${detectorId}`,
        },
        BREADCRUMBS.EDIT_MODEL_CONFIGURATION,
      ]);
    } else {
      core.chrome.setBreadcrumbs([
        BREADCRUMBS.ANOMALY_DETECTOR,
        BREADCRUMBS.DETECTORS,
        BREADCRUMBS.CREATE_DETECTOR,
      ]);
    }
  }, [detector]);

  useEffect(() => {
    if (hasError) {
      props.history.push('/detectors');
    }
  }, [hasError]);

  const handleFormValidation = async (
    formikProps: FormikProps<ModelConfigurationFormikValues>
  ) => {
    if (props.isEdit && detector.curState === DETECTOR_STATE.RUNNING) {
      core.notifications.toasts.addDanger(
        'Detector cannot be updated while it is running'
      );
    } else {
      formikProps.setSubmitting(true);
      formikProps.setFieldTouched('featureList');
      formikProps.setFieldTouched('categoryField', isHCDetector);
      formikProps.setFieldTouched('shingleSize');
      formikProps.validateForm().then((errors) => {
        if (isEmpty(errors)) {
          if (props.isEdit) {
            // TODO: possibly add logic to also start RT and/or historical from here. Need to think
            // about adding similar logic from edit detector definition page
            const detectorToUpdate = formikToModelConfiguration(
              formikProps.values,
              detector
            );
            handleUpdateDetector(detectorToUpdate);
          } else {
            optionallySaveValues({
              ...formikProps.values,
              categoryFieldEnabled: isHCDetector,
            });
            //@ts-ignore
            props.setStep(3);
          }
        } else {
          // TODO: can add focus to all components or possibly customize error message too
          if (get(errors, 'featureList')) {
            focusOnFirstWrongFeature(errors, formikProps.setFieldTouched);
          } else if (get(errors, 'categoryField')) {
            focusOnCategoryField();
          }

          core.notifications.toasts.addDanger(
            'One or more input fields is invalid'
          );
        }
      });
    }
    formikProps.setSubmitting(false);
  };

  const handleUpdateDetector = async (detectorToUpdate: Detector) => {
    dispatch(updateDetector(detectorId, detectorToUpdate))
      .then((response: any) => {
        core.notifications.toasts.addSuccess(
          `Detector updated: ${response.response.name}`
        );
        props.history.push(`/detectors/${detectorId}/configurations/`);
      })
      .catch((err: any) => {
        core.notifications.toasts.addDanger(
          prettifyErrorMessage(
            getErrorMessage(err, 'There was a problem updating the detector')
          )
        );
      });
  };

  const optionallySaveValues = (values: ModelConfigurationFormikValues) => {
    if (props.setInitialValues) {
      props.setInitialValues(values);
    }
  };

  const detectorToCreate = props.isEdit
    ? detector
    : formikToDetector({
        ...props.detectorDefinitionValues,
        ...props.initialValues,
      } as CreateDetectorFormikValues);

  return (
    <Formik
      initialValues={
        props.initialValues
          ? props.initialValues
          : modelConfigurationToFormik(detector)
      }
      enableReinitialize={true}
      onSubmit={() => {}}
      validateOnMount={props.isEdit ? false : true}
      validate={validateFeatures}
    >
      {(formikProps) => (
        <Fragment>
          <EuiPage
            style={{
              marginTop: '-24px',
            }}
          >
            <EuiPageBody>
              <EuiPageHeader>
                <EuiPageHeaderSection>
                  <EuiTitle size="l">
                    <h1>
                      {props.isEdit
                        ? 'Edit model configuration'
                        : 'Configure model'}{' '}
                    </h1>
                  </EuiTitle>
                </EuiPageHeaderSection>
              </EuiPageHeader>
              <Features detector={detector} formikProps={formikProps} />
              <EuiSpacer />
              <CategoryField
                isEdit={props.isEdit}
                isHCDetector={isHCDetector}
                categoryFieldOptions={getCategoryFields(indexDataTypes)}
                setIsHCDetector={setIsHCDetector}
                isLoading={isLoading}
                originalShingleSize={originalShingleSize}
                formikProps={formikProps}
              />
              <EuiSpacer />
              <AdvancedSettings />
              {!isEmpty(detectorToCreate) ? <EuiSpacer /> : null}
              {!isEmpty(detectorToCreate) ? (
                <SampleAnomalies
                  detector={detectorToCreate}
                  featureList={formikProps.values.featureList}
                  shingleSize={formikProps.values.shingleSize}
                  categoryFields={formikProps.values.categoryField}
                  errors={formikProps.errors}
                  setFieldTouched={formikProps.setFieldTouched}
                />
              ) : null}
            </EuiPageBody>
          </EuiPage>

          <EuiFlexGroup
            alignItems="center"
            justifyContent="flexEnd"
            gutterSize="s"
            style={{ marginRight: '12px' }}
          >
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                onClick={() => {
                  if (props.isEdit) {
                    props.history.push(
                      `/detectors/${detectorId}/configurations/`
                    );
                  } else {
                    props.history.push('/detectors');
                  }
                }}
              >
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            {props.isEdit ? null : (
              <EuiFlexItem grow={false}>
                <EuiButton
                  iconSide="left"
                  iconType="arrowLeft"
                  fill={false}
                  data-test-subj="configureModelPreviousButton"
                  //@ts-ignore
                  onClick={() => {
                    optionallySaveValues({
                      ...formikProps.values,
                      categoryFieldEnabled: isHCDetector,
                    });
                    //@ts-ignore
                    props.setStep(1);
                  }}
                >
                  Previous
                </EuiButton>
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              {props.isEdit ? (
                <EuiButton
                  type="submit"
                  fill={true}
                  data-test-subj="updateDetectorButton"
                  //@ts-ignore
                  onClick={() => {
                    handleFormValidation(formikProps);
                  }}
                >
                  Save changes
                </EuiButton>
              ) : (
                <EuiButton
                  type="submit"
                  iconSide="right"
                  iconType="arrowRight"
                  fill={true}
                  data-test-subj="configureModelNextButton"
                  isLoading={formikProps.isSubmitting}
                  //@ts-ignore
                  onClick={() => {
                    handleFormValidation(formikProps);
                  }}
                >
                  Next
                </EuiButton>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      )}
    </Formik>
  );
}
