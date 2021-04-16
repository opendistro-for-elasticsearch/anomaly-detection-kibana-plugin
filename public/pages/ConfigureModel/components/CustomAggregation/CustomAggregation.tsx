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

import React from 'react';
import { EuiFormRow, EuiCodeEditor } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { isInvalid, getError } from '../../../../utils/utils';

interface CustomAggregationProps {
  index: number;
}

export const validateQuery = (value: string) => {
  try {
    JSON.parse(value);
  } catch (err) {
    console.log('Returning error', err);
    return 'Invalid JSON';
  }
};

export const CustomAggregation = (props: CustomAggregationProps) => {
  return (
    <Field
      id={`featureList.${props.index}.aggregationQuery`}
      name={`featureList.${props.index}.aggregationQuery`}
      validate={validateQuery}
    >
      {({ field, form }: FieldProps) => (
        <EuiFormRow
          fullWidth
          label="Expression"
          helpText="Custom expression uses the Elasticsearch query DSL."
          isInvalid={isInvalid(field.name, form)}
          error={getError(field.name, form)}
          onClick={() => {
            form.setFieldTouched(
              `featureList.${props.index}.aggregationQuery`,
              true
            );
          }}
        >
          <EuiCodeEditor
            name={`featureList.${props.index}.aggregationQuery`}
            mode="object"
            height="300px"
            width="100%"
            setOptions={{
              showLineNumbers: false,
              showGutter: false,
              className: 'custom-query-editor',
              showPrintMargin: false,
            }}
            onChange={(query: string) => {
              form.setFieldValue(
                `featureList.${props.index}.aggregationQuery`,
                query
              );
            }}
            onBlur={field.onBlur}
            value={field.value}
          />
        </EuiFormRow>
      )}
    </Field>
  );
};
