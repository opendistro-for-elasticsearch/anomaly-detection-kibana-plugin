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
  EuiCheckbox,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiOverlayMask,
  EuiSelect,
  EuiTitle,
  EUI_MODAL_CANCEL_BUTTON,
} from '@elastic/eui';
import { Field, FieldProps, Form, Formik } from 'formik';
import { get, isEmpty } from 'lodash';
import React, { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  Detector,
  FeatureAttributes,
  FEATURE_TYPE,
} from '../../../models/interfaces';
import { updateDetector } from '../../../redux/reducers/ad';
import {
  getError,
  getErrorMessage,
  isInvalid,
  required,
} from '../../../utils/utils';
import { AggregationSelector } from '../components/AggregationSelector';
import { CustomAggregation } from '../components/CustomAggregation';
import { FEATURE_TYPE_OPTIONS } from './utils/constants';
import {
  FeaturesFormikValues,
  prepareDetector,
} from './utils/formikToFeatures';

type CreateFeatureProps = {
  initialValues: FeaturesFormikValues;
  topOffset: number;
  onUpdatePreview(): void;
  featureToEdit: string;
  onClose: any;
  detector: Detector;
  featureAttributes: FeatureAttributes[];
  isSticky: boolean;
};

const MAX_NAME_SIZE = 256;

export function CreateFeature(props: CreateFeatureProps) {
  const dispatch = useDispatch();
  const isEdit = !!props.featureToEdit;
  const [showDeleteConfirmation, setDeleteConfirmation] = useState<boolean>(
    false
  );

  const validateFeatureName = (featureName: string): string | undefined => {
    if (isEmpty(featureName)) {
      return 'Required';
    }
    if (featureName.length > MAX_NAME_SIZE) {
      return `Name is too big maximum limit is ${MAX_NAME_SIZE}`;
    }
    const findIndex = props.featureAttributes.findIndex(
      (attribute: FeatureAttributes) =>
        attribute.featureName.toLowerCase() === featureName.toLowerCase()
    );
    //If more than one detectors found, duplicate exists.
    if (!isEdit && findIndex > -1) {
      throw 'Duplicate feature name';
    }
    if (findIndex > -1 && isEdit) {
      if (
        props.initialValues.featureName !==
        props.featureAttributes[findIndex].featureName
      ) {
        return 'Duplicate feature name';
      }
    }
  };

  const handleDelete = async () => {
    try {
      const requestBody = {
        ...props.detector,
        featureAttributes: (get(
          props.detector,
          'featureAttributes',
          []
        ) as FeatureAttributes[]).filter(
          (feature: FeatureAttributes) =>
            feature.featureId !== props.featureToEdit
        ),
      };
      dispatch(updateDetector(props.detector.id, requestBody));
      toastNotifications.addSuccess(`Feature has been deleted successfully`);
      props.onUpdatePreview();
      props.onClose();
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem deleting feature')
      );
    }
  };

  const handleSubmit = async (values: FeaturesFormikValues, formikBag: any) => {
    const requestBody = prepareDetector(
      values,
      props.detector,
      props.featureToEdit
    );
    try {
      await dispatch(updateDetector(props.detector.id, requestBody));
      if (isEdit) {
        toastNotifications.addSuccess(`Feature updated: ${values.featureName}`);
      } else {
        toastNotifications.addSuccess(`Feature created: ${values.featureName}`);
      }
      formikBag.setSubmitting(false);
      props.onUpdatePreview();
      props.onClose();
    } catch (err) {
      if (isEdit) {
        toastNotifications.addDanger(
          getErrorMessage(
            err,
            `There was a problem updating feature ${values.featureName}`
          )
        );
      } else {
        toastNotifications.addDanger(
          getErrorMessage(
            err,
            `There was a problem creating feature ${values.featureName}`
          )
        );
      }
      formikBag.setSubmitting(false);
    }
  };
  return (
    <React.Fragment>
      <Formik
        enableReinitialize
        initialValues={props.initialValues}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, dirty }) => (
          <Form>
            {/*
            // @ts-ignore */}
            <EuiFlyout
              size="s"
              maxWidth={424}
              onClose={props.onClose}
              // @ts-ignore
              style={{
                top: props.isSticky ? '111px' : `${224 - props.topOffset}px`,
                borderTop: '0px',
              }}
              className={'feature-flyout'}
            >
              <EuiFlyoutHeader hasBorder className="flyout">
                <EuiTitle size="xs" className="preview-title">
                  <h5>{values.featureName || 'New feature'}</h5>
                </EuiTitle>
              </EuiFlyoutHeader>
              <EuiFlyoutBody className="flyout">
                <Field name="enabled">
                  {({ field, form }: FieldProps) => (
                    <EuiFormRow
                      label="Feature state"
                      isInvalid={isInvalid(field.name, form)}
                      error={getError(field.name, form)}
                    >
                      <EuiCheckbox
                        id={'enabled'}
                        label="Enable feature"
                        checked={field.value}
                        {...field}
                      />
                    </EuiFormRow>
                  )}
                </Field>
                <Field name="featureName" validate={validateFeatureName}>
                  {({ field, form }: FieldProps) => (
                    <EuiFormRow
                      label="Feature name"
                      helpText="Specify descriptive name that helps you to identify purpose of this feature"
                      isInvalid={isInvalid(field.name, form)}
                      error={getError(field.name, form)}
                    >
                      <EuiFieldText
                        name="featureName"
                        id="featureName"
                        placeholder="Name of feature"
                        {...field}
                      />
                    </EuiFormRow>
                  )}
                </Field>

                <Field name={`featureType`} validate={required}>
                  {({ field, form }: FieldProps) => {
                    return (
                      <Fragment>
                        <EuiFormRow
                          label="Feature type"
                          isInvalid={isInvalid(field.name, form)}
                          error={getError(field.name, form)}
                        >
                          <EuiSelect
                            {...field}
                            options={FEATURE_TYPE_OPTIONS}
                            isInvalid={isInvalid(field.name, form)}
                            data-test-subj="featureType"
                          />
                        </EuiFormRow>
                        {field.value === FEATURE_TYPE.SIMPLE ? (
                          <AggregationSelector />
                        ) : (
                          <CustomAggregation />
                        )}
                      </Fragment>
                    );
                  }}
                </Field>
              </EuiFlyoutBody>
              <EuiFlyoutFooter className="flyout">
                <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                  {isEdit ? (
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty
                        onClick={() => setDeleteConfirmation(true)}
                      >
                        Delete
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                  ) : null}
                  <EuiFlexItem grow={false}>
                    <EuiButton
                      fill
                      type="submit"
                      isLoading={isSubmitting}
                      disabled={!dirty}
                      data-test-subj="updateDetectorFeature"
                    >
                      {isEdit ? 'Update' : 'Save'}
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlyoutFooter>
            </EuiFlyout>
          </Form>
        )}
      </Formik>
      {showDeleteConfirmation ? (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="Delete this feature?"
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
}
