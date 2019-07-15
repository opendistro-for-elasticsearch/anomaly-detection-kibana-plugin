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
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiHorizontalRule,
  EuiSelect,
  EuiText,
} from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import React, { Fragment } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { getError, isInvalid, required } from '../../../../utils/utils';
import { ADFormikValues } from '../../containers/models/interfaces';
import { FILTER_TYPES_OPTIONS } from './utils/constant';
import { SimpleFilter } from './SimpleFilter';
import { QueryDataFilter } from './QueryDataFilter';
import { FILTER_TYPES } from '../../../../models/interfaces';
interface DataFilterProps {
  formikProps: FormikProps<ADFormikValues>;
}

function DataFilter(props: DataFilterProps) {
  return (
    <ContentPanel
      title="Data filter"
      titleSize="s"
      panelStyles={{ paddingBottom: '0px' }}
      bodyStyles={{ padding: '0px' }}
      horizontalRuleClassName={'filters-panel'}
    >
      <Fragment>
        <Field name={`filterType`} validate={required}>
          {({ field, form }: FieldProps) => (
            <Fragment>
              <EuiFlexGroup direction="column" style={{ padding: '10px' }}>
                <EuiFlexItem style={{ marginBottom: '0' }}>
                  <EuiFormRow>
                    <EuiText size="s">
                      Filters let you choose a subset of data from your data
                      source. Make a simple filter, or use the Elasticsearch
                      Query DSL for advanced filters.
                    </EuiText>
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow
                    label="Filter type"
                    isInvalid={isInvalid(field.name, form)}
                    error={getError(field.name, form)}
                  >
                    <EuiSelect
                      {...field}
                      options={FILTER_TYPES_OPTIONS}
                      isInvalid={isInvalid(field.name, form)}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiHorizontalRule margin="none" />
              {field.value === FILTER_TYPES.SIMPLE ? (
                <SimpleFilter formikProps={props.formikProps} />
              ) : (
                <QueryDataFilter />
              )}
            </Fragment>
          )}
        </Field>
      </Fragment>
    </ContentPanel>
  );
}

export { DataFilter };
