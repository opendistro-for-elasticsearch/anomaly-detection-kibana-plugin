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

import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import { EuiFormRow, EuiSelect, EuiComboBox } from '@elastic/eui';
import { getAllFields } from '../../../../redux/selectors/elasticsearch';
import {
  getNumberFieldOptions,
  getCountableFieldOptions,
} from '../../utils/helpers';
import { Field, FieldProps } from 'formik';
import { AGGREGATION_TYPES } from '../../utils/constants';
import {
  requiredSelectField,
  requiredNonEmptyFieldSelected,
  isInvalid,
  getError,
} from '../../../../utils/utils';

interface AggregationSelectorProps {
  index?: number;
}
export const AggregationSelector = (props: AggregationSelectorProps) => {
  const numberFields = getNumberFieldOptions(useSelector(getAllFields));
  const countableFields = getCountableFieldOptions(useSelector(getAllFields));
  return (
    <Fragment>
      <Field
        id={`featureList.${props.index}.aggregationBy`}
        name={`featureList.${props.index}.aggregationBy`}
        validate={requiredSelectField}
      >
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Aggregation method"
            helpText="The aggregation method determines what constitutes an anomaly. For example, if you choose min(), the detector focuses on finding anomalies based on the minimum values of your feature."
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiSelect
              id={`featureList.${props.index}.aggregationBy`}
              {...field}
              name={`featureList.${props.index}.aggregationBy`}
              options={AGGREGATION_TYPES}
              onChange={(e) => {
                const currentValue = field.value;
                const aggregationOf = get(
                  form,
                  `values.featureList.${props.index}.aggregationOf.0.type`
                );
                if (
                  currentValue === 'value_count' &&
                  aggregationOf !== 'number'
                ) {
                  form.setFieldValue(
                    `featureList.${props.index}.aggregationOf`,
                    undefined
                  );
                }
                field.onChange(e);
              }}
              data-test-subj="aggregationType"
            />
          </EuiFormRow>
        )}
      </Field>

      <Field
        id={`featureList.${props.index}.aggregationOf`}
        name={`featureList.${props.index}.aggregationOf`}
        validate={requiredNonEmptyFieldSelected}
      >
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Field"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiComboBox
              placeholder="Select field"
              singleSelection={{ asPlainText: true }}
              selectedOptions={field.value}
              onCreateOption={(createdOption: string) => {
                const normalizedOptions = createdOption.trim();
                if (!normalizedOptions) return;
                const customOption = [{ label: normalizedOptions }];
                form.setFieldValue(
                  `featureList.${props.index}.aggregationOf`,
                  customOption
                );
              }}
              //@ts-ignore
              options={
                get(form, `values.featureList.${props.index}.aggregationBy`) ===
                'value_count'
                  ? countableFields
                  : numberFields
              }
              {...field}
              onClick={() => {
                form.setFieldTouched(
                  `featureList.${props.index}.aggregationOf`,
                  true
                );
              }}
              onChange={(options: any) => {
                form.setFieldValue(
                  `featureList.${props.index}.aggregationOf`,
                  options
                );
              }}
            />
          </EuiFormRow>
        )}
      </Field>
    </Fragment>
  );
};
