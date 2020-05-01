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

import { EuiFormRow, EuiHorizontalRule, EuiSelect } from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import React, { Fragment } from 'react';
import { getError, isInvalid, required } from '../../../../utils/utils';
import { ADFormikValues } from '../../containers/models/interfaces';
import { FILTER_TYPES_OPTIONS } from './utils/constant';
import { SimpleFilter } from './SimpleFilter';
import { QueryDataFilter } from './QueryDataFilter';
import { FILTER_TYPES } from '../../../../models/interfaces';
import { FormattedFormRow } from '../FormattedFormRow/FormattedFormRow';
interface DataFilterProps {
  formikProps: FormikProps<ADFormikValues>;
}

function DataFilter(props: DataFilterProps) {
  return (
    <Field name={`filterType`} validate={required}>
      {({ field, form }: FieldProps) => (
        <Fragment>
          <FormattedFormRow
            fullWidth
            formattedTitle={
              <p>
                Data filter
                <span className="optional">- optional</span>
              </p>
            }
            hint={[
              'Choose a subset of your data source to focus your data stream and reduce noisy data.',
              'Use the visual editor to create a simple filter, or use the Elasticsearch query DSL to create more advanced filters.',
            ]}
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiSelect
              {...field}
              options={FILTER_TYPES_OPTIONS}
              isInvalid={isInvalid(field.name, form)}
            />
          </FormattedFormRow>
          <EuiHorizontalRule margin="none" />
          {field.value === FILTER_TYPES.SIMPLE ? (
            <SimpleFilter formikProps={props.formikProps} />
          ) : (
            <QueryDataFilter />
          )}
        </Fragment>
      )}
    </Field>
  );
}

export { DataFilter, DataFilterProps };
