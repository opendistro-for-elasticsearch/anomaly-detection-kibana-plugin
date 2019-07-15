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
  EuiFieldNumber,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
} from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React from 'react';
import { UIFilter } from '../../../../models/interfaces';
import { DATA_TYPES } from '../../../../utils/constants';
import { getError, isInvalid, required } from '../../../../utils/utils';
import { OPERATORS_MAP, WHERE_BOOLEAN_FILTERS } from './utils/constant';
import { isRangeOperator, validateRange } from './utils/helpers';

interface FilterValueProps {
  dataType: string;
  operator: OPERATORS_MAP;
  index: number;
  filterValues: UIFilter;
}

function FilterValue(props: FilterValueProps) {
  if (props.dataType === DATA_TYPES.NUMBER) {
    if (isRangeOperator(props.operator)) {
      return (
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <Field
              name={`filters.${props.index}.fieldRangeStart`}
              validate={(rangeStartValue: number) =>
                validateRange(rangeStartValue, props.filterValues)
              }
            >
              {({ field, form }: FieldProps) => (
                <EuiFormRow
                  label="From"
                  isInvalid={isInvalid(field.name, form)}
                  error={getError(field.name, form)}
                >
                  <EuiFieldNumber
                    {...field}
                    isInvalid={isInvalid(field.name, form)}
                  />
                </EuiFormRow>
              )}
            </Field>
          </EuiFlexItem>
          <EuiFlexItem>
            <Field
              name={`filters.${props.index}.fieldRangeEnd`}
              validate={(rangeEndValue: number) =>
                validateRange(rangeEndValue, props.filterValues)
              }
            >
              {({ field, form }: FieldProps) => (
                <EuiFormRow
                  label="To"
                  isInvalid={isInvalid(field.name, form)}
                  error={getError(field.name, form)}
                >
                  <EuiFieldNumber
                    {...field}
                    isInvalid={isInvalid(field.name, form)}
                  />
                </EuiFormRow>
              )}
            </Field>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    } else {
      return (
        <Field name={`filters.${props.index}.fieldValue`} validate={required}>
          {({ field, form }: FieldProps) => (
            <EuiFormRow
              label="Value"
              isInvalid={isInvalid(field.name, form)}
              error={getError(field.name, form)}
            >
              <EuiFieldNumber
                {...field}
                isInvalid={isInvalid(field.name, form)}
              />
            </EuiFormRow>
          )}
        </Field>
      );
    }
  } else if (props.dataType == DATA_TYPES.BOOLEAN) {
    return (
      <Field name={`filters.${props.index}.fieldValue`} validate={required}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Value"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiSelect
              {...field}
              options={WHERE_BOOLEAN_FILTERS}
              isInvalid={isInvalid(field.name, form)}
            />
          </EuiFormRow>
        )}
      </Field>
    );
  } else {
    return (
      <Field name={`filters.${props.index}.fieldValue`} validate={required}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow label="Value">
            <EuiFieldText {...field} isInvalid={isInvalid(field.name, form)} />
          </EuiFormRow>
        )}
      </Field>
    );
  }
}

export default FilterValue;
