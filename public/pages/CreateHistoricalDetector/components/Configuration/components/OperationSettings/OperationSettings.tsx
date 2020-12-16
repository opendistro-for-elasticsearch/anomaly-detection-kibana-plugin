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
  EuiCheckbox,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldNumber,
} from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import React from 'react';
import { FormattedFormRow } from '../../../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import ContentPanel from '../../../../../../components/ContentPanel/ContentPanel';
import {
  getError,
  isInvalid,
  validatePositiveInteger,
} from '../../../../../../utils/utils';
import {
  HistoricalDetectorFormikValues,
  SAVE_HISTORICAL_DETECTOR_OPTIONS,
} from '../../../../utils/constants';

interface OperationSettingsProps {
  formikProps: FormikProps<HistoricalDetectorFormikValues>;
  selectedOption: SAVE_HISTORICAL_DETECTOR_OPTIONS;
  onOptionChange(id: string): void;
}

export function OperationSettings(props: OperationSettingsProps) {
  return (
    <ContentPanel title="Operation settings" titleSize="s">
      <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
        <Field name="detectionInterval" validate={validatePositiveInteger}>
          {({ field, form }: FieldProps) => (
            <EuiFlexGroup direction="column">
              <EuiFlexItem style={{ maxWidth: '70%' }}>
                <FormattedFormRow
                  fullWidth
                  title="Detection interval"
                  hint="Define how often the detector collects data to generate
                    anomalies. The shorter the interval is, the more
                    detector results there will be, and the more computing resources
                    the detector will need."
                  isInvalid={isInvalid(field.name, form)}
                  error={getError(field.name, form)}
                >
                  <EuiFlexGroup gutterSize="s" alignItems="center">
                    <EuiFlexItem grow={false}>
                      <EuiFieldNumber
                        name="detectionInterval"
                        id="detectionInterval"
                        placeholder="Detector interval"
                        data-test-subj="detectionInterval"
                        {...field}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiText>
                        <p className="minutes">minutes</p>
                      </EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </FormattedFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiCheckbox
                  id={'runDetectorAutomaticallyCheckbox'}
                  label="Run detector automatically after creating"
                  checked={
                    props.selectedOption ===
                    SAVE_HISTORICAL_DETECTOR_OPTIONS.START
                  }
                  disabled={false}
                  onChange={() => {
                    const reverseOption =
                      props.selectedOption ===
                      SAVE_HISTORICAL_DETECTOR_OPTIONS.START
                        ? SAVE_HISTORICAL_DETECTOR_OPTIONS.KEEP_STOPPED
                        : SAVE_HISTORICAL_DETECTOR_OPTIONS.START;
                    props.onOptionChange(reverseOption);
                  }}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        </Field>
      </EuiFlexGroup>
    </ContentPanel>
  );
}
