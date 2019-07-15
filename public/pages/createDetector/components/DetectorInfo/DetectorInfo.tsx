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

import { EuiFieldText, EuiFormRow, EuiText, EuiTextArea } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { getError, isInvalid } from '../../../../utils/utils';
import { validateDetectorDesc } from './utils/validation';

interface DetectorInfoProps {
  onValidateDetectorName: (detectorName: string) => Promise<any>;
}
function DetectorInfo(props: DetectorInfoProps) {
  return (
    <ContentPanel title="Define detector" titleSize="s">
      <EuiFormRow>
        <EuiText size="s">
          To define a detector, you start by providing a name and description.
        </EuiText>
      </EuiFormRow>
      <Field name="detectorName" validate={props.onValidateDetectorName}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label=" Detector name"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiFieldText
              name="detectorName"
              id="detectorName"
              placeholder="sample detector"
              isInvalid={isInvalid(field.name, form)}
              {...field}
            />
          </EuiFormRow>
        )}
      </Field>
      <Field name="detectorDescription" validate={validateDetectorDesc}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Description"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiTextArea
              name="detectorDescription"
              id="detectorDescription"
              rows={3}
              placeholder="Description for detector"
              {...field}
              isInvalid={isInvalid(field.name, form)}
            />
          </EuiFormRow>
        )}
      </Field>
    </ContentPanel>
  );
}

export default DetectorInfo;
