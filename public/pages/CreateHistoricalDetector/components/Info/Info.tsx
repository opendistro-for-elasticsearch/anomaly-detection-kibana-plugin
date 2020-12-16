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

import { EuiFieldText, EuiTextArea } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { getError, isInvalid } from '../../../../utils/utils';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';

interface InfoProps {
  onValidateDetectorName: (detectorName: string) => any;
  onValidateDetectorDescription: (detectorDescription: string) => any;
}
export function Info(props: InfoProps) {
  return (
    <ContentPanel title="Name and description" titleSize="s">
      <Field name="name" validate={props.onValidateDetectorName}>
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
              name="name"
              id="name"
              placeholder="Enter detector name"
              isInvalid={isInvalid(field.name, form)}
              onBlur={() => {
                form.setFieldTouched('name', true);
              }}
              {...field}
            />
          </FormattedFormRow>
        )}
      </Field>
      <Field name="description" validate={props.onValidateDetectorDescription}>
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
              name="description"
              id="description"
              rows={3}
              placeholder="Enter detector description"
              isInvalid={isInvalid(field.name, form)}
              onBlur={() => {
                form.setFieldTouched('description', true);
              }}
              {...field}
            />
          </FormattedFormRow>
        )}
      </Field>
    </ContentPanel>
  );
}
