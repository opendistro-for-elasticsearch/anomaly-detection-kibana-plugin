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

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiCodeEditor,
} from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React from 'react';
import { getError, isInvalid } from '../../../../../utils/utils';
import { UIFilter } from '../../../../../models/interfaces';
import { DetectorDefinitionFormikValues } from '../../../models/interfaces';
import { validFilterQuery } from '../utils/helpers';

interface CustomFilterProps {
  filter: UIFilter;
  index: number;
  values: DetectorDefinitionFormikValues;
  replace(index: number, value: any): void;
}

export const CustomFilter = (props: CustomFilterProps) => {
  return (
    <EuiFlexGroup
      style={{ padding: '0px', width: '400px' }}
      alignItems="stretch"
      direction="column"
    >
      <EuiFlexItem grow={false}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <Field
              name={`filters.${props.index}.query`}
              validate={validFilterQuery}
            >
              {({ field, form }: FieldProps) => (
                <EuiFormRow
                  fullWidth
                  label="Elasticsearch query DSL"
                  isInvalid={isInvalid(field.name, form)}
                  error={getError(field.name, form)}
                >
                  <EuiCodeEditor
                    name="query"
                    mode="json"
                    width="100%"
                    height="250px"
                    theme="github"
                    isInvalid={isInvalid(field.name, form)}
                    error={getError(field.name, form)}
                    onChange={(query: string) => {
                      form.setFieldValue(`filters.${props.index}.query`, query);
                    }}
                    onBlur={() => {
                      form.setFieldTouched(`filters.${props.index}.query`);
                    }}
                    value={field.value}
                  />
                </EuiFormRow>
              )}
            </Field>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
