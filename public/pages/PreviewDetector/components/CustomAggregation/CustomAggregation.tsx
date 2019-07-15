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

import React from 'react';
//@ts-ignore
import { EuiFormRow, EuiCodeEditor } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { isInvalid, getError } from '../../../../utils/utils';

import 'brace/ext/language_tools';

interface CustomAggregationProps {}

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
    <Field name="customAggregation" validate={validateQuery}>
      {({ field, form }: FieldProps) => (
        <EuiFormRow
          fullWidth
          label="Expression"
          helpText="Custom expression use the Elasticsearch query DSL."
          isInvalid={isInvalid(field.name, form)}
          error={getError(field.name, form)}
        >
          <EuiCodeEditor
            name="customAggregation"
            mode="object"
            height="300px"
            width="100%"
            setOptions={{
              showLineNumbers: false,
              showGutter: false,
              className: 'custom-query-editor',
              showPrintMargin: false,
            }}
            isInvalid={isInvalid(field.name, form)}
            onChange={(query: string) => {
              //Reset operator and values
              form.setFieldValue('customAggregation', query);
            }}
            onBlur={field.onBlur}
            value={field.value}
          />
        </EuiFormRow>
      )}
    </Field>
  );
};
