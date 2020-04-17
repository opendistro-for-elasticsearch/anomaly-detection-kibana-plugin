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
  EuiTextColor,
  EuiCheckbox,
  EuiPageHeaderSection,
  EuiFieldText,
  EuiAccordion,
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiLink,
  EuiPage,
  EuiFormRow,
  EuiButton,
  EuiSelect,
  EuiTitle,
  EuiCallOut,
  EuiOverlayMask,
  EuiButtonEmpty,
  EuiModal,
  EuiModalHeader,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiLoadingSpinner,
  EuiRadioGroup,
  EuiIcon,
} from '@elastic/eui';
import moment, { Moment } from 'moment';
import {
  Field,
  FieldArray,
  FieldProps,
  FieldArrayRenderProps,
  Form,
  Formik,
} from 'formik';
import { get, isEmpty } from 'lodash';
import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { previewDetector } from '../../../redux/reducers/anomalies';
import { AppState } from '../../../redux/reducers';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  Detector,
  AnomalyData,
  FeatureAttributes,
  FEATURE_TYPE,
} from '../../../models/interfaces';
import { updateDetector, startDetector } from '../../../redux/reducers/ad';
import {
  getError,
  getErrorMessage,
  isInvalidField,
  required,
} from '../../../utils/utils';
import { AggregationSelector } from '../components/AggregationSelector';
import { CustomAggregation } from '../components/CustomAggregation';
import { FEATURE_TYPE_OPTIONS, MAX_FEATURE_NUM } from './utils/constants';
import {
  FeaturesFormikValues,
  prepareDetector,
  formikToSimpleAggregation,
} from './utils/formikToFeatures';
import { useFetchDetectorInfo } from '../../createDetector/hooks/useFetchDetectorInfo';
//@ts-ignore
import chrome from 'ui/chrome';
import { BREADCRUMBS } from '../../../utils/constants';
import { v4 as uuidv4 } from 'uuid';
import { TotalAnomaliesChart } from '../components/AnomaliesChart/TotalAnomaliesChart';
import { FeatureAnomaliesChart } from './FeatureAnomaliesChart';
import { useHideSideNavBar } from '../../main/hooks/useHideSideNavBar';

interface FeaturesRouterProps {
  detectorId?: string;
}

interface EditFeaturesProps extends RouteComponentProps<FeaturesRouterProps> {}

const MAX_NAME_SIZE = 256;
//TODO split into smaller components
export function EditFeatures(props: EditFeaturesProps) {
  const dispatch = useDispatch();
  useHideSideNavBar(true, false);
  const detectorId = get(props, 'match.params.detectorId', '');
  const { detector, hasError } = useFetchDetectorInfo(detectorId);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState<boolean>(
    false
  );
  const [radioIdSelected, setRadioIdSelected] = useState<string>(
    'start_ad_job'
  );
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [readyToStartAdJob, setReadyToStartAdJob] = useState<boolean>(true);

  // For preview:
  const [isLoading, setIsLoading] = useState(false);
  const [previewDone, setPreviewDone] = useState(false);
  const [newDetector, setNewDetector] = useState<Detector>(detector);
  const [fristPreview, setFristPreview] = useState<boolean>(true);
  const [previewDateRangeOption, setPreviewDateRangeOption] = useState<string>(
    'last_7_days'
  );

  useEffect(() => {
    if (detector) {
      setIsLoading(false);
    }
    chrome.breadcrumbs.set([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DETECTORS,
      {
        text: detector ? detector.name : '',
        href: `#/detectors/${detectorId}`,
      },
      BREADCRUMBS.EDIT_FEATURES,
    ]);
  }, [detector]);

  useEffect(() => {
    if (hasError) {
      props.history.push('/detectors');
    }
  }, [hasError]);

  const validateFeatureName = (featureName: string): string | undefined => {
    if (isEmpty(featureName)) {
      return 'Required';
    }
    if (featureName.length > MAX_NAME_SIZE) {
      return `Name is too big maximum limit is ${MAX_NAME_SIZE}`;
    }
  };

  const featureDescription = () => (
    <EuiText size="s">
      <p className="content-panel-subtitle">
        Specify an index field that you want to find anomalies for by defining
        features. An detector can discover anomalies across up to 5 features.{' '}
        <EuiLink
          href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
          target="_blank"
        >
          Learn more <EuiIcon size="s" type="popout" />
        </EuiLink>
      </p>
    </EuiText>
  );

  const simpleAggDescription = (feature: any) => (
    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <p>
            <EuiTextColor color="subdued">
              Field: {get(feature, 'aggregationOf.0.label')}
            </EuiTextColor>
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <p>
            <EuiTextColor color="subdued">
              Aggregation method: {feature.aggregationBy}
            </EuiTextColor>
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <p>
            <EuiTextColor color="subdued">
              State: {feature.featureEnabled ? 'Enabled' : 'Disabled'}
            </EuiTextColor>
          </p>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const customAggDescription = (feature: any) => (
    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <p>
            <EuiTextColor color="subdued">Custom expression</EuiTextColor>
          </p>
        </EuiText>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <p>
            <EuiTextColor color="subdued">
              State: {feature.featureEnabled ? 'Enabled' : 'Disabled'}
            </EuiTextColor>
          </p>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const featureButtonContent = (feature: any) => {
    return (
      <div>
        <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
          <EuiFlexItem>
            <EuiTitle size="s" className="euiAccordionForm__title">
              <h3>
                {feature.featureName ? feature.featureName : 'Add feature'}
              </h3>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
        {feature && feature.featureType === 'simple_aggs'
          ? simpleAggDescription(feature)
          : customAggDescription(feature)}
      </div>
    );
  };

  const extraAction = (onClick: any) => (
    <EuiButton size="s" color="danger" onClick={onClick}>
      Delete
    </EuiButton>
  );

  const featureAccordion = (
    onDelete: any,
    index: number,
    feature: any,
    handleChange: any
  ) => (
    <EuiAccordion
      id={`featureList.${index}`}
      key={index}
      buttonContent={featureButtonContent(feature)}
      //@ts-ignore
      buttonClassName="euiAccordionForm__button"
      className="euiAccordionForm"
      paddingSize="l"
      initialIsOpen={!!get(feature, 'newFeature')}
      extraAction={extraAction(onDelete)}
    >
      <Field
        name={`featureList.${index}.featureName`}
        validate={validateFeatureName}
        // validate={isInvalidField(field.name, form)}
      >
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Feature name"
            helpText="Enter a descriptive name. The name must be unique within this detector"
            isInvalid={isInvalidField(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiFieldText
              name={`featureList.${index}.featureName`}
              id={`featureList.${index}.featureName`}
              placeholder="Enter feature name"
              value={field.value ? field.value : feature.featureName}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field name={`featureList.${index}.featureEnabled`}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Feature state"
            isInvalid={isInvalidField(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiCheckbox
              id={`featureList.${index}.featureEnabled`}
              label="Enable feature"
              checked={field.value ? field.value : feature.featureEnabled}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>

      <Field name={`featureList.${index}.featureType`} validate={required}>
        {({ field, form }: FieldProps) => (
          <Fragment>
            <EuiFormRow
              label="Find anomalies based on"
              isInvalid={isInvalidField(field.name, form)}
              error={getError(field.name, form)}
            >
              <EuiSelect
                {...field}
                options={FEATURE_TYPE_OPTIONS}
                value={
                  feature.featureType === 'simple_aggs'
                    ? FEATURE_TYPE.SIMPLE
                    : FEATURE_TYPE.CUSTOM
                }
                onChange={e => {
                  handleChange(e);
                  if (
                    e.currentTarget.value === 'custom_aggs' &&
                    !get(form.errors, `featureList.${index}`)
                  ) {
                    const aggregationQuery = formikToSimpleAggregation(feature);
                    form.setFieldValue(
                      `featureList.${index}.aggregationQuery`,
                      JSON.stringify(aggregationQuery, null, 4)
                    );
                  }
                }}
              />
            </EuiFormRow>
            {field.value === FEATURE_TYPE.SIMPLE ? (
              <AggregationSelector index={index} />
            ) : (
              <CustomAggregation index={index} />
            )}
          </Fragment>
        )}
      </Field>
    </EuiAccordion>
  );

  const renderFeatures = (handleChange: any) => {
    return (
      <FieldArray name="featureList" validateOnChange={true}>
        {({ push, remove, form: { values } }: FieldArrayRenderProps) => {
          // @ts-ignore
          if (firstLoad && values.featureList.length === 0) {
            push({
              featureId: uuidv4(),
              featureName: undefined,
              featureType: 'simple_aggs',
              featureEnabled: true,
              importance: 1,
              aggregationQuery: JSON.stringify(
                { aggregation_name: { sum: { field: 'field_name' } } },
                null,
                4
              ),
              newFeature: true,
            });
          }
          setFirstLoad(false);
          return (
            <Fragment>
              {}
              {values.featureList.map((feature: any, index: number) =>
                featureAccordion(
                  () => {
                    remove(index);
                  },
                  index,
                  feature,
                  handleChange
                )
              )}

              <EuiFlexGroup
                alignItems="center"
                style={{ padding: '12px 24px' }}
              >
                <EuiFlexItem grow={false}>
                  <EuiButton
                    data-test-subj="addFeature"
                    isDisabled={values.featureList.length >= MAX_FEATURE_NUM}
                    onClick={() => {
                      push({
                        featureId: uuidv4(),
                        featureName: undefined,
                        featureType: 'simple_aggs',
                        featureEnabled: true,
                        importance: 1,
                        aggregationQuery: JSON.stringify(
                          {
                            aggregation_name: { sum: { field: 'field_name' } },
                          },
                          null,
                          4
                        ),
                        newFeature: true,
                      });
                    }}
                  >
                    Add another feature
                  </EuiButton>
                  <EuiText size="s">
                    You can add{' '}
                    {Math.max(MAX_FEATURE_NUM - values.featureList.length, 0)}{' '}
                    more features
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </Fragment>
          );
        }}
      </FieldArray>
    );
  };

  const generateInitialValue = (detector: Detector): FeaturesFormikValues[] => {
    const featureUiMetaData = get(detector, 'uiMetadata.features', []);
    const features = get(detector, 'featureAttributes', []);
    // @ts-ignore
    return features.map((feature: FeatureAttributes) => {
      return {
        ...featureUiMetaData[feature.featureName],
        ...feature,
        aggregationQuery: JSON.stringify(feature['aggregationQuery'], null, 4),
        aggregationOf: get(
          featureUiMetaData,
          `${feature.featureName}.aggregationOf`
        )
          ? [
              {
                label: get(
                  featureUiMetaData,
                  `${feature.featureName}.aggregationOf`
                ),
              },
            ]
          : [],
        featureType: get(
          featureUiMetaData,
          `${feature.featureName}.featureType`
        )
          ? get(featureUiMetaData, `${feature.featureName}.featureType`)
          : 'custom_aggs',
      };
    });
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

  const handleSubmit = async (values: any, setSubmitting: any) => {
    setSubmitting(true);
    try {
      const requestBody = prepareDetector(
        get(values, 'featureList', []),
        detector
      );
      await dispatch(updateDetector(detector.id, requestBody));
      toastNotifications.addSuccess('Feature updated');
      if (radioIdSelected === 'start_ad_job') {
        handleStartAdJob(detector.id);
      }
      setSubmitting(false);
      props.history.push(`/detectors/${detectorId}`);
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem updating feature')
      );
      setSubmitting(false);
    }
  };

  const validateFeatures = (values: any) => {
    const featureList = get(values, 'featureList', []);
    let featureNameCount = new Map<string, number>();

    featureList.forEach((attribute: FeatureAttributes) => {
      if (attribute.featureName) {
        const featureName = attribute.featureName.toLowerCase();
        if (featureNameCount.has(featureName)) {
          featureNameCount.set(
            featureName,
            // @ts-ignore
            featureNameCount.get(featureName) + 1
          );
        } else {
          featureNameCount.set(featureName, 1);
        }
      }
    });

    let hasError = false;
    const featureErrors = featureList.map((attribute: FeatureAttributes) => {
      if (attribute.featureName) {
        // @ts-ignore
        if (featureNameCount.get(attribute.featureName.toLowerCase()) > 1) {
          hasError = true;
          return { featureName: 'Duplicate feature name' };
        } else {
          return undefined;
        }
      } else {
        hasError = true;
        // @ts-ignore
        return {
          featureName: 'Required',
        };
      }
    });
    return hasError
      ? {
          featureList: featureErrors,
        }
      : undefined;
  };

  const startAdJobOptions = (disableStartAdJob: boolean) => {
    return [
      {
        id: 'start_ad_job',
        label: 'Automatically run detector (Recommended)',
        disabled: disableStartAdJob,
      },
      {
        id: 'keep_ad_job_stopped',
        label: 'Manually start the detector at a later time',
      },
    ];
  };

  const sampleAnomaliesDescription = () => {
    return (
      <EuiText size="s">
        {/* <p style={{ fontSize: '12pt', color: '#69707D' }}> */}
        <p className="content-panel-subtitle">
          Preview how your anomalies may look like from sample feature output
          and adjust the feature settings as needed.{' '}
          <EuiLink
            href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
            target="_blank"
          >
            Learn more
            <EuiIcon size="s" type="popout" />
          </EuiLink>
        </p>
      </EuiText>
    );
  };

  type PreviewRangeState = {
    startDate: Moment;
    endDate: Moment;
  };

  const [dateRange, setDateRange] = useState<PreviewRangeState>({
    startDate: moment().subtract(7, 'days'),
    endDate: moment(),
  });

  const handleUpdatePreview = useCallback(async () => {}, [
    dateRange.startDate,
    dateRange.endDate,
  ]);

  const handleOnCreate = useCallback(() => {}, []);

  const handleDateRangeChange = useCallback(
    (startDate: Moment, endDate: Moment, dateRangeOption: string) => {
      setDateRange({
        startDate,
        endDate,
      });
      setPreviewDateRangeOption(dateRangeOption);
    },
    []
  );

  const anomaliesResult = useSelector(
    (state: AppState) => state.anomalies.anomaliesResult
  );

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
      setFristPreview(false);
    } catch (err) {
      setIsLoading(false);
    }
  }

  const getSampleAnomalies = (
    featureList: FeaturesFormikValues[],
    detector: Detector
  ) => {
    try {
      const newDetector = prepareDetector(featureList, detector, true);
      setPreviewDone(false);
      setNewDetector(newDetector);
      getSampleAdResult(newDetector);
    } catch (err) {
      console.log('Fail to get updated detector', err);
    }
  };
  const preivewAnomalies = (
    featureList: FeaturesFormikValues[],
    errors: any
  ) => (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel
          title="Sample anomalies"
          titleSize="s"
          description={sampleAnomaliesDescription()}
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
                    {fristPreview
                      ? 'You can preview how your anomalies may look like from sample feature output and adjust the feature settings as needed.'
                      : 'Use sample data as a reference to fine tune settings. Click "Refresh" if you makes any adjustment to see latest preview. Once you are done with edits, save changes and run detector to see real time and accurate anomalies based on your full data set'}
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    type="submit"
                    isLoading={false}
                    data-test-subj="previewDetector"
                    onClick={() => getSampleAnomalies(featureList, detector)}
                    disabled={
                      !!get(errors, 'featureList', []).find(
                        // @ts-ignore
                        featureError => !!featureError
                      ) || featureList.length === 0
                    }
                    fill={!fristPreview}
                  >
                    {fristPreview ? 'Preview anomalies' : 'Refresh'}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiCallOut>
          )}
          <EuiSpacer />
          {previewDone ? (
            <Fragment>
              <TotalAnomaliesChart
                title="Sample anomaly history"
                onDateRangeChange={handleDateRangeChange}
                anomalies={anomaliesResult.anomalies}
                isLoading={false}
                startDateTime={dateRange.startDate}
                endDateTime={dateRange.endDate}
                annotations={annotations}
                anomalyGradeSeriesName="Sample anomaly grade"
                confidenceSeriesName="Sample confidence"
                dateRangeOption={previewDateRangeOption}
                detectorId={detector.id}
                detectorName={detector.name}
              />
              <EuiSpacer />
              <FeatureAnomaliesChart
                title="Sample feature breakdown"
                detector={newDetector}
                onEdit={() => alert('edit')}
                featureEditId={''}
                anomaliesResult={anomaliesResult}
                annotations={annotations}
                onUpdatePreview={handleUpdatePreview}
                isLoading={false}
                onCreateFeature={handleOnCreate}
                startDateTime={dateRange.startDate}
                endDateTime={dateRange.endDate}
                featureDataSeriesName="Sample feature output"
                featureAnomalyAnnotationSeriesName="Sample anomaly output"
                showAnomalyAsBar={true}
              />
            </Fragment>
          ) : null}
        </ContentPanel>
      </EuiPageBody>
    </EuiPage>
  );

  return (
    <Fragment>
      <Formik
        enableReinitialize
        initialValues={{ featureList: generateInitialValue(detector) }}
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
        }) => (
          <Form>
            <EuiPage>
              <EuiPageBody>
                <EuiPageHeader>
                  <EuiPageHeaderSection>
                    <EuiTitle size="l">
                      <h1>Edit features </h1>
                    </EuiTitle>
                  </EuiPageHeaderSection>
                </EuiPageHeader>
                <ContentPanel
                  title="Features"
                  titleSize="s"
                  subTitle={featureDescription()}
                >
                  {renderFeatures(handleChange)}
                </ContentPanel>
              </EuiPageBody>
            </EuiPage>

            {preivewAnomalies(values.featureList, errors)}

            <EuiPage>
              <EuiPageBody>
                {detector.enabled ? (
                  <EuiCallOut
                    title="Can't save feature changes as detector is running."
                    color="warning"
                    iconType="alert"
                  ></EuiCallOut>
                ) : null}

                {!dirty && !detector.enabled ? (
                  <EuiCallOut
                    title="No need to save as feature configuration not changed."
                    iconType="help"
                  ></EuiCallOut>
                ) : null}

                {!!get(errors, 'featureList', []).filter(
                  featureError => featureError
                ).length ? (
                  <EuiCallOut
                    title="Can't save feature changes as there are errors"
                    color="warning"
                    iconType="alert"
                  ></EuiCallOut>
                ) : null}

                <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      onClick={() =>
                        props.history.push(`/detectors/${detectorId}`)
                      }
                    >
                      Cancel
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      fill
                      type="button"
                      data-test-subj="updateAdjustModel"
                      isLoading={isSubmitting}
                      disabled={
                        detector.enabled ||
                        isSubmitting ||
                        !dirty ||
                        !!get(errors, 'featureList', []).filter(
                          featureError => featureError
                        ).length
                      }
                      onClick={() => {
                        if (values.featureList.length == 0) {
                          setRadioIdSelected('keep_ad_job_stopped');
                        } else {
                          setRadioIdSelected('start_ad_job');
                        }
                        setReadyToStartAdJob(values.featureList.length > 0);
                        if (values.featureList.length > 0) {
                          setShowSaveConfirmation(true);
                        } else {
                          setRadioIdSelected('keep_ad_job_stopped');
                          handleSubmit(values, setSubmitting);
                        }
                      }}
                    >
                      Save changes
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPageBody>
            </EuiPage>

            {showSaveConfirmation ? (
              <EuiOverlayMask>
                <EuiModal onClose={() => setShowSaveConfirmation(false)}>
                  <EuiModalHeader>
                    <EuiModalHeaderTitle>
                      Automatically start the detector?
                    </EuiModalHeaderTitle>
                  </EuiModalHeader>

                  <EuiModalBody
                    style={{ paddingLeft: '24px', paddingRight: '24px' }}
                  >
                    {/* {formSample} */}
                    <EuiFlexGroup direction="column">
                      <EuiFlexItem grow={false}>
                        <EuiText>
                          <p>
                            The detector is currently stopped. To receive
                            accurate and real-time anomalies, the detector need
                            to start and collect sufficient data to include your
                            latest change. The earlier the detector starts
                            running, the sooner the anomalies will be available.
                          </p>
                        </EuiText>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiRadioGroup
                          name="start ad radio group"
                          options={startAdJobOptions(!readyToStartAdJob)}
                          idSelected={radioIdSelected}
                          onChange={setRadioIdSelected}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiModalBody>

                  <EuiModalFooter>
                    <EuiButtonEmpty
                      onClick={() => setShowSaveConfirmation(false)}
                    >
                      Cancel
                    </EuiButtonEmpty>

                    <EuiButton
                      fill
                      onClick={() => {
                        handleSubmit(values, setSubmitting);
                        setShowSaveConfirmation(false);
                      }}
                    >
                      Confirm
                    </EuiButton>
                  </EuiModalFooter>
                </EuiModal>
              </EuiOverlayMask>
            ) : null}
          </Form>
        )}
      </Formik>
    </Fragment>
  );
}
