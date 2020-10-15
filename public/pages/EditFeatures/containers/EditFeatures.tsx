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
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiLink,
  EuiPage,
  EuiButton,
  EuiTitle,
  EuiOverlayMask,
  EuiButtonEmpty,
  EuiIcon,
  EuiCallOut,
  EuiSpacer,
  EuiFieldNumber,
  EuiFormRow,
} from '@elastic/eui';
import {
  FieldArray,
  FieldArrayRenderProps,
  Form,
  Formik,
  Field,
  FieldProps,
} from 'formik';
import { get, isEmpty } from 'lodash';
import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { AppState } from '../../../redux/reducers';
import { updateDetector, startDetector } from '../../../redux/reducers/ad';
import { getMappings } from '../../../redux/reducers/elasticsearch';
import {
  getErrorMessage,
  validatePositiveInteger,
  isInvalid,
  getError,
  validateCategoryField,
} from '../../../utils/utils';
import { prepareDetector } from './utils/formikToFeatures';
import { useFetchDetectorInfo } from '../../createDetector/hooks/useFetchDetectorInfo';
//@ts-ignore
import chrome from 'ui/chrome';
import { BREADCRUMBS, MAX_FEATURE_NUM } from '../../../utils/constants';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';
import { FeatureAccordion } from '../components/FeatureAccordion/FeatureAccordion';
import { SaveFeaturesConfirmModal } from '../components/ConfirmModal/SaveFeaturesConfirmModal';
import { SAVE_FEATURE_OPTIONS } from '../utils/constants';
import { SHINGLE_SIZE } from '../../../utils/constants';
import {
  initialFeatureValue,
  generateInitialFeatures,
  validateFeatures,
  focusOnFirstWrongFeature,
  focusOnCategoryField,
  getCategoryFields,
} from '../utils/helpers';
import { SampleAnomalies } from './SampleAnomalies';
import { CategoryField } from '../components/CategoryField/CategoryField';

interface FeaturesRouterProps {
  detectorId?: string;
}

interface EditFeaturesProps extends RouteComponentProps<FeaturesRouterProps> {}

export function EditFeatures(props: EditFeaturesProps) {
  const dispatch = useDispatch();
  useHideSideNavBar(true, false);
  const detectorId = get(props, 'match.params.detectorId', '');
  const { detector, hasError } = useFetchDetectorInfo(detectorId);
  const indexDataTypes = useSelector(
    (state: AppState) => state.elasticsearch.dataTypes
  );
  const [showSaveConfirmation, setShowSaveConfirmation] = useState<boolean>(
    false
  );
  const [saveFeatureOption, setSaveFeatureOption] = useState<
    SAVE_FEATURE_OPTIONS
  >(SAVE_FEATURE_OPTIONS.START_AD_JOB);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [readyToStartAdJob, setReadyToStartAdJob] = useState<boolean>(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(
    false
  );
  const [isHCDetector, setIsHCDetector] = useState<boolean>(false);
  const isLoading =
    useSelector((state: AppState) => state.elasticsearch.requesting) ||
    firstLoad;

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
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      {
        text: detector && detector.name ? detector.name : '',
        href: `#/detectors/${detectorId}`,
      },
      BREADCRUMBS.EDIT_MODEL_CONFIGURATION,
    ]);
  }, [detector]);

  useEffect(() => {
    if (hasError) {
      props.history.push('/detectors');
    }
  }, [hasError]);

  const featureDescription = (
    <EuiText className="content-panel-subTitle">
      Specify an index field that you want to find anomalies for by defining
      features. You can add up to 5 features.{' '}
      <EuiLink
        href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
        target="_blank"
      >
        Learn more <EuiIcon size="s" type="popout" />
      </EuiLink>
    </EuiText>
  );

  const renderFeatures = (handleChange: any) => {
    return (
      <FieldArray name="featureList" validateOnChange={true}>
        {({ push, remove, form: { values } }: FieldArrayRenderProps) => {
          // @ts-ignore
          if (
            firstLoad &&
            get(detector, 'featureAttributes', []).length === 0
          ) {
            push(initialFeatureValue());
          }
          setFirstLoad(false);
          return (
            <Fragment>
              {get(detector, 'indices.0', '').includes(':') ? (
                <div>
                  <EuiCallOut
                    title="This detector is using a remote cluster index, so you need to manually input the field."
                    color="warning"
                    iconType="alert"
                  />
                  <EuiSpacer size="m" />
                </div>
              ) : null}

              {values.featureList.map((feature: any, index: number) => (
                <FeatureAccordion
                  onDelete={() => {
                    remove(index);
                  }}
                  index={index}
                  feature={feature}
                  handleChange={handleChange}
                />
              ))}

              <EuiFlexGroup
                alignItems="center"
                style={{ padding: '16px 24px 0px' }}
              >
                <EuiFlexItem grow={false}>
                  <EuiButton
                    data-test-subj="addFeature"
                    isDisabled={values.featureList.length >= MAX_FEATURE_NUM}
                    onClick={() => {
                      push(initialFeatureValue());
                    }}
                  >
                    Add another feature
                  </EuiButton>
                  <EuiText className="content-panel-subTitle">
                    <p>
                      You can add{' '}
                      {Math.max(MAX_FEATURE_NUM - values.featureList.length, 0)}{' '}
                      more features.
                    </p>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          );
        }}
      </FieldArray>
    );
  };

  const handleStartAdJob = async (detectorId: string) => {
    try {
      await dispatch(startDetector(detectorId));
      toastNotifications.addSuccess(
        `Detector job has been started successfully`
      );
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem starting detector job')
      );
    }
  };

  const handleSaveFeatureOptionChange = useCallback((id: string) => {
    setSaveFeatureOption(id as SAVE_FEATURE_OPTIONS);
  }, []);

  const handleSubmit = async (values: any, setSubmitting: any) => {
    setSubmitting(true);
    try {
      const requestBody = prepareDetector(
        get(values, 'featureList', []),
        get(values, 'shingleSize', SHINGLE_SIZE),
        get(values, 'categoryField', []),
        detector
      );
      await dispatch(updateDetector(detector.id, requestBody));
      toastNotifications.addSuccess('Feature updated');
      if (saveFeatureOption === 'start_ad_job') {
        handleStartAdJob(detector.id);
      }
      setSubmitting(false);
      props.history.push(`/detectors/${detectorId}/configurations`);
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem updating feature')
      );
      setSubmitting(false);
    }
  };

  const handleSaveChanges = (
    values: any,
    errors: any,
    setFieldTouched: any,
    setSubmitting: any
  ) => {
    if (detector.enabled) {
      toastNotifications.addDanger(
        "Can't edit feature as the detector is running"
      );
      return;
    }

    if (
      isHCDetector &&
      validateCategoryField(values.categoryField) !== undefined
    ) {
      setFieldTouched('categoryField', true);
      focusOnCategoryField();
      return;
    }

    if (!focusOnFirstWrongFeature(errors, setFieldTouched)) {
      if (values.featureList.length == 0) {
        setSaveFeatureOption(SAVE_FEATURE_OPTIONS.KEEP_AD_JOB_STOPPED);
      } else {
        setSaveFeatureOption(SAVE_FEATURE_OPTIONS.START_AD_JOB);
      }
      if (errors.categoryField) {
        focusOnCategoryField();
        return;
      }
      // TODO: refactor advanced settings into separate component
      // to allow for proper rendering to allow to focus on advanced settings component
      if (errors.shingleSize) {
        return;
      }
      setReadyToStartAdJob(values.featureList.length > 0);
      if (values.featureList.length > 0) {
        setShowSaveConfirmation(true);
      } else {
        setSaveFeatureOption(SAVE_FEATURE_OPTIONS.KEEP_AD_JOB_STOPPED);
        handleSubmit(values, setSubmitting);
      }
    }
  };

  const renderAdvancedSettingsToggle = () => (
    <EuiText
      className="content-panel-subTitle"
      onClick={() => {
        setShowAdvancedSettings(!showAdvancedSettings);
      }}
    >
      <EuiLink>{showAdvancedSettings ? 'Hide' : 'Show'}</EuiLink>
    </EuiText>
  );

  const renderAdvancedSettings = () => (
    <Field name="shingleSize" validate={validatePositiveInteger}>
      {({ field, form }: FieldProps) => (
        <EuiFormRow
          label="Window size"
          helpText={
            <EuiText className="content-panel-subTitle">
              Set the number of intervals to consider in a detection window. We
              recommend you choose this value based on your actual data. If you
              expect missing values in your data or if you want the anomalies
              based on the current interval, choose 1. If your data is
              continuously ingested and you want the anomalies based on multiple
              intervals, choose a larger window size.{' '}
              <EuiLink
                href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
                target="_blank"
              >
                Learn more <EuiIcon size="s" type="popout" />
              </EuiLink>
            </EuiText>
          }
          isInvalid={isInvalid(field.name, form)}
          error={getError(field.name, form)}
        >
          <EuiFlexGroup gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiFieldNumber
                id="shingleSize"
                placeholder="Window size"
                data-test-subj="shingleSize"
                {...field}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText>
                <p className="minutes">intervals</p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
      )}
    </Field>
  );

  return (
    <Fragment>
      <Formik
        enableReinitialize
        initialValues={{
          featureList: generateInitialFeatures(detector),
          shingleSize: get(detector, 'shingleSize', SHINGLE_SIZE),
          categoryField: get(detector, 'categoryField', []),
        }}
        onSubmit={(values, actions) =>
          handleSubmit(values, actions.setSubmitting)
        }
        validate={validateFeatures}
      >
        {({
          values,
          isSubmitting,
          dirty,
          setSubmitting,
          handleChange,
          errors,
          setFieldTouched,
        }) => (
          <Fragment>
            <Form>
              <EuiPage>
                <EuiPageBody>
                  <EuiPageHeader>
                    <EuiPageHeaderSection>
                      <EuiTitle size="l">
                        <h1>Model configuration </h1>
                      </EuiTitle>
                    </EuiPageHeaderSection>
                  </EuiPageHeader>
                  <ContentPanel title="Features" subTitle={featureDescription}>
                    {!isEmpty(detector) ? renderFeatures(handleChange) : null}
                  </ContentPanel>
                </EuiPageBody>
              </EuiPage>
              <CategoryField
                isHCDetector={isHCDetector}
                categoryFieldOptions={getCategoryFields(indexDataTypes)}
                setIsHCDetector={setIsHCDetector}
                isLoading={isLoading}
              />
              <EuiPage>
                <EuiPageBody>
                  <ContentPanel
                    title="Advanced Settings"
                    subTitle={renderAdvancedSettingsToggle()}
                  >
                    {!isEmpty(detector) && showAdvancedSettings
                      ? renderAdvancedSettings()
                      : null}
                  </ContentPanel>
                </EuiPageBody>
              </EuiPage>
            </Form>
            {!isEmpty(detector) ? (
              <SampleAnomalies
                detector={detector}
                featureList={values.featureList}
                shingleSize={values.shingleSize}
                categoryFields={values.categoryField}
                errors={errors}
                setFieldTouched={setFieldTouched}
              />
            ) : null}

            <EuiPage>
              <EuiPageBody>
                <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      onClick={() =>
                        props.history.push(
                          `/detectors/${detectorId}/configurations`
                        )
                      }
                    >
                      Cancel
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      fill
                      type="submit"
                      data-test-subj="updateAdjustModel"
                      isLoading={isSubmitting}
                      onClick={() =>
                        handleSaveChanges(
                          values,
                          errors,
                          setFieldTouched,
                          setSubmitting
                        )
                      }
                    >
                      Save and start detector
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPageBody>
            </EuiPage>
            {showSaveConfirmation ? (
              <EuiOverlayMask>
                <SaveFeaturesConfirmModal
                  readyToStartAdJob={readyToStartAdJob}
                  saveFeatureOption={saveFeatureOption}
                  onClose={() => setShowSaveConfirmation(false)}
                  onCancel={() => setShowSaveConfirmation(false)}
                  onConfirm={() => {
                    handleSubmit(values, setSubmitting);
                    setShowSaveConfirmation(false);
                  }}
                  onOptionChange={handleSaveFeatureOptionChange}
                />
              </EuiOverlayMask>
            ) : null}
          </Fragment>
        )}
      </Formik>
    </Fragment>
  );
}
