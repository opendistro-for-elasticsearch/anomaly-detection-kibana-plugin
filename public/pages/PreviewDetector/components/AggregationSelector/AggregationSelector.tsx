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
import { useSelector } from 'react-redux';
import { EuiFormRow, EuiSelect, EuiComboBox } from '@elastic/eui';
import { getAllFields } from '../../../../redux/selectors/elasticsearch';
import { getNumberFields } from '../../utils/helpers';
import { Field, FieldProps } from 'formik';
import { AGGREGATION_TYPES } from '../../utils/constants';
import { required, isInvalid, getError } from '../../../../utils/utils';

export const AggregationSelector = () => {
  const numberFields = getNumberFields(useSelector(getAllFields));
  return (
    <div>
      <Field name="aggregationBy" validate={required}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Aggregation by"
            helpText="Select an aggregation to be performed on the selected field for the selected sample size"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiSelect
              options={AGGREGATION_TYPES}
              {...field}
              data-test-subj="aggregationType"
            />
          </EuiFormRow>
        )}
      </Field>
      <Field name="aggregationOf" validate={required}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Field"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiComboBox
              singleSelection
              selectedOptions={field.value}
              //@ts-ignore
              options={numberFields}
              {...field}
              onChange={(options: any) => {
                form.setFieldValue(`aggregationOf`, options);
              }}
            />
          </EuiFormRow>
        )}
      </Field>
    </div>
  );
};
