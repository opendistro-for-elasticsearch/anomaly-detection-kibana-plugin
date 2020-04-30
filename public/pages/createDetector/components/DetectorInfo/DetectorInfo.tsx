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

import { EuiFieldText, EuiTextArea, EuiFormRow } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { getError, isInvalid } from '../../../../utils/utils';
import { validateDetectorDesc } from './utils/validation';
import { FormattedFormRow } from '../FormattedFormRow/FormattedFormRow';

interface DetectorInfoProps {
  onValidateDetectorName: (detectorName: string) => Promise<any>;
}
function DetectorInfo(props: DetectorInfoProps) {
  return (
    <ContentPanel title="Name and description" titleSize="s">
      <Field name="detectorName" validate={props.onValidateDetectorName}>
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            title="Name"
            hint="Specify a unique and descriptive name that is easy to
          recognize. Detector name must contain 1-64 characters. 
          Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiFieldText
              name="detectorName"
              id="detectorName"
              placeholder="Enter detector name"
              isInvalid={isInvalid(field.name, form)}
              {...field}
            />
          </FormattedFormRow>
        )}
      </Field>
      <Field name="detectorDescription" validate={validateDetectorDesc}>
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            formattedTitle={
              <p>
                Description <span className="optional">- optional</span>
              </p>
            }
            hint="Describe the purpose of the detector."
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiTextArea
              name="detectorDescription"
              id="detectorDescription"
              rows={3}
              placeholder="Describe the detector"
              {...field}
              isInvalid={isInvalid(field.name, form)}
            />
          </FormattedFormRow>
        )}
      </Field>
    </ContentPanel>
  );
}

export default DetectorInfo;
