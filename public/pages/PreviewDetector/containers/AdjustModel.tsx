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
  EuiSpacer,
  EuiCheckbox,
  EuiFieldNumber,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiHorizontalRule,
  EuiTitle,
  EuiText,
} from '@elastic/eui';
import {
  Field,
  FieldProps,
  Form,
  Formik,
  FieldArray,
  FieldArrayRenderProps,
} from 'formik';
import React from 'react';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  isInvalid,
  getError,
  validatePositiveInteger,
  validateNonNegativeInteger,
  getErrorMessage,
} from '../../../utils/utils';
import { Detector } from '../../../models/interfaces';
import { FeaturesFormikValues } from './utils/formikToFeatures';
import { featuresToFormik } from './utils/featuresToFormik';
import { get } from 'lodash';
import { prepareTunedDetector } from './utils/formikToAdjustModel';
import { updateDetector } from '../../../redux/reducers/ad';
import { useDispatch } from 'react-redux';

type AdjustModelProps = {
  topOffset: number;
  isSticky: boolean;
  detector: Detector;
  onClose: any;
  onUpdatePreview(): void;
};

export type AdjustModelFormikValues = {
  formikFeatures: FeaturesFormikValues[];
  detectionInterval: number;
  windowDelay: number;
};

const getInitialValues = (detector: Detector) => ({
  formikFeatures: Object.values(featuresToFormik(detector)),
  detectionInterval: get(detector, 'detectionInterval.period.interval', 10),
  windowDelay: get(detector, 'windowDelay.period.interval', 0),
});

export function AdjustModel(props: AdjustModelProps) {
  const dispatch = useDispatch();
  const handleTuneSubmit = async (values: AdjustModelFormikValues) => {
    const requestBody = prepareTunedDetector(values, props.detector);
    try {
      await dispatch(updateDetector(props.detector.id, requestBody));
      toastNotifications.addSuccess(`Detector has been adjusted successfully`);
      props.onUpdatePreview();
      props.onClose();
    } catch (err) {
      toastNotifications.addDanger(
        getErrorMessage(err, 'There was a problem adjusting detector')
      );
    }
  };
  return (
    <Formik
      initialValues={getInitialValues(props.detector)}
      onSubmit={handleTuneSubmit}
    >
      {({ values, isSubmitting }) => (
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
            className="feature-flyout"
          >
            <EuiFlyoutHeader hasBorder className="flyout">
              <EuiText size="s" className="preview-title" grow={false}>
                <h2> Adjust model </h2>
              </EuiText>
            </EuiFlyoutHeader>
            <EuiFlyoutBody className="flyout">
              <FieldArray name="formikFeatures">
                {({
                  unshift,
                  remove,
                  replace,
                  form: { values },
                }: FieldArrayRenderProps) => {
                  return values.formikFeatures.map(
                    (formikFeature: FeaturesFormikValues, index: number) => {
                      return (
                        <Field name={`formikFeatures.${index}.enabled`}>
                          {({ field }: FieldProps) => {
                            return (
                              <React.Fragment>
                                <EuiText
                                  size="s"
                                  className="preview-title"
                                  grow={false}
                                >
                                  <h5>{formikFeature.featureName}</h5>
                                </EuiText>
                                <EuiHorizontalRule margin="xs" />
                                <EuiCheckbox
                                  id={formikFeature.featureName}
                                  label="Enable feature"
                                  checked={field.value}
                                  {...field}
                                />
                                <EuiSpacer />
                              </React.Fragment>
                            );
                          }}
                        </Field>
                      );
                    }
                  );
                }}
              </FieldArray>
              <EuiSpacer size="xs" />
              <EuiTitle size="xs" className="preview-title">
                <h5>Global Settings</h5>
              </EuiTitle>
              <EuiHorizontalRule margin="xs" />
              <Field
                name="detectionInterval"
                validate={validatePositiveInteger}
              >
                {({ field, form }: FieldProps) => (
                  <EuiFormRow
                    label="Detector interval"
                    helpText="Specify interval in minutes"
                    isInvalid={isInvalid(field.name, form)}
                    error={getError(field.name, form)}
                  >
                    <EuiFieldNumber
                      name="detectionInterval"
                      id="detectionInterval"
                      placeholder="Detector interval"
                      data-test-subj="detectionInterval"
                      {...field}
                    />
                  </EuiFormRow>
                )}
              </Field>
              <Field
                name="windowDelay"
                validate={validateNonNegativeInteger}
              >
                {({ field, form }: FieldProps) => (
                  <EuiFormRow
                    label="Window delay"
                    helpText="Specify data delay in minutes"
                    isInvalid={isInvalid(field.name, form)}
                    error={getError(field.name, form)}
                  >
                    <EuiFieldNumber
                      name="windowDelay"
                      id="windowDelay"
                      placeholder="Window delay"
                      data-test-subj="windowDelay"
                      {...field}
                    />
                  </EuiFormRow>
                )}
              </Field>
            </EuiFlyoutBody>
            <EuiFlyoutFooter className="flyout">
              <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiButton
                    fill
                    type="submit"
                    isLoading={isSubmitting}
                    data-test-subj="updateAdjustModel"
                  >
                    Save
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlyoutFooter>
          </EuiFlyout>
        </Form>
      )}
    </Formik>
  );
}
