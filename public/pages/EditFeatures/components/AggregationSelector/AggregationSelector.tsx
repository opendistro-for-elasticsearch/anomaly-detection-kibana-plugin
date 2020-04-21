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

import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import { EuiFormRow, EuiSelect, EuiComboBox } from '@elastic/eui';
import { getAllFields } from '../../../../redux/selectors/elasticsearch';
import { getNumberFields } from '../../utils/helpers';
import { Field, FieldProps } from 'formik';
import { AGGREGATION_TYPES } from '../../utils/constants';
import {
  required,
  requiredNonEmptyArray,
  isInvalid,
  getError,
} from '../../../../utils/utils';

interface AggregationSelectorProps {
  index?: number;
}
export const AggregationSelector = (props: AggregationSelectorProps) => {
  const numberFields = getNumberFields(useSelector(getAllFields));
  return (
    <Fragment>
      <Field
        name={`featureList.${props.index}.aggregationOf`}
        validate={requiredNonEmptyArray}
      >
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

      <Field
        name={`featureList.${props.index}.aggregationBy`}
        validate={required}
      >
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Aggregation method"
            helpText="The aggregation method determins what constitutes an anomaly. For example, if you choose min(), the detector focuses on finding anomalies based on the minimum values of your feature."
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
    </Fragment>
  );
};
