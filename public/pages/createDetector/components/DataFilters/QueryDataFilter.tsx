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
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  //@ts-ignore
  EuiCodeEditor,
} from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { isInvalid, getError } from '../../../../utils/utils';
import 'brace/mode/json';
import 'brace/theme/github';
import { validFilterQuery } from './utils/helpers';

interface QueryDataFilterProps {}

export const QueryDataFilter = (props: QueryDataFilterProps) => {
  return (
    <EuiFlexGroup style={{ padding: '10px' }}>
      <EuiFlexItem>
        <Field name="filterQuery" validate={validFilterQuery}>
          {({ field, form }: FieldProps) => (
            <EuiFormRow
              fullWidth
              label="Use Elasticsearch query DSL to write a custom filter."
              isInvalid={isInvalid(field.name, form)}
              error={getError(field.name, form)}
            >
              <EuiCodeEditor
                name="filterQuery"
                mode="json"
                width="100%"
                theme="github"
                isInvalid={isInvalid(field.name, form)}
                onChange={(query: string) => {
                  //Reset operator and values
                  form.setFieldValue('filterQuery', query);
                }}
                onBlur={field.onBlur}
                value={field.value}
              />
            </EuiFormRow>
          )}
        </Field>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
