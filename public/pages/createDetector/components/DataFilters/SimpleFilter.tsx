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
  EuiAccordion,
  EuiButton,
  EuiComboBox,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiHorizontalRule,
  EuiSelect,
  EuiPanel,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';
import {
  Field,
  FieldArray,
  FieldArrayRenderProps,
  FieldProps,
  FormikProps,
} from 'formik';
import { cloneDeep, get } from 'lodash';
import React, { useEffect, Fragment } from 'react';
import { useSelector } from 'react-redux';

import { UIFilter } from '../../../../models/interfaces';
import { getAllFields } from '../../../../redux/selectors/elasticsearch';
import { DATA_TYPES } from '../../../../utils/constants';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { getError, isInvalid, required } from '../../../../utils/utils';
import { ADFormikValues } from '../../containers/models/interfaces';
import { EMPTY_UI_FILTER } from '../../containers/utils/constant';
import { AddFilterButton } from './AddFilterButton';
import FilterValue from './FilterValue';
import {
  displayText,
  getIndexFields,
  getOperators,
  isNullOperator,
} from './utils/helpers';

interface DataFilterProps {
  formikProps: FormikProps<ADFormikValues>;
}

export const SimpleFilter = (props: DataFilterProps) => {
  const indexFields = getIndexFields(useSelector(getAllFields));
  const darkMode = darkModeEnabled();
  const selectedIndices = get(props, 'formikProps.values.index[0].label', '');
  //Reset, if selectedIndices change filter could become invalid
  useEffect(() => {
    const initialIndex = get(
      props,
      'formikProps.initialValues.index[0].label',
      undefined
    );
    if (initialIndex !== selectedIndices) {
      props.formikProps.setFieldValue('filters', []);
    }
  }, [selectedIndices]);
  const lightModeStyles = {
    backgroundColor: '#F6F6F6',
  };
  return (
    <FieldArray name="filters" validateOnChange={true}>
      {({
        unshift,
        remove,
        replace,
        form: { values },
      }: FieldArrayRenderProps) => (
        <Fragment>
          <EuiFlexGroup
            alignItems="center"
            justifyContent="flexEnd"
            style={{ padding: '10px' }}
          >
            <EuiFlexItem grow={false}>
              <AddFilterButton unshift={unshift} />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiHorizontalRule margin="none" />

          <EuiPanel style={darkMode ? {} : lightModeStyles}>
            {values.filters.map((filter: UIFilter, index: number) => {
              return (
                <EuiPanel className="filter-container">
                  <EuiAccordion
                    key={index}
                    id={'name'}
                    initialIsOpen={true}
                    buttonContent={displayText(filter)}
                    extraAction={
                      <div style={{ paddingRight: '10px' }}>
                        <EuiButton
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          Remove
                        </EuiButton>
                      </div>
                    }
                  >
                    <EuiHorizontalRule margin="xs" />
                    <EuiFlexGroup
                      style={{ padding: '0px 10px' }}
                      justifyContent="flexStart"
                    >
                      <EuiFlexItem grow={false} style={{ width: '40%' }}>
                        <EuiFlexGroup>
                          <EuiFlexItem>
                            <Field
                              name={`filters.${index}.fieldInfo`}
                              validate={required}
                            >
                              {({ field, form }: FieldProps) => (
                                <EuiFormRow
                                  label="Field"
                                  isInvalid={isInvalid(field.name, form)}
                                  error={getError(field.name, form)}
                                >
                                  <EuiComboBox
                                    id={`filters.${index}.fieldInfo`}
                                    singleSelection={true}
                                    placeholder="Choose a field"
                                    async
                                    isClearable
                                    //@ts-ignore
                                    options={indexFields}
                                    selectedOptions={field.value}
                                    {...field}
                                    onChange={options => {
                                      //Reset operator and values
                                      replace(
                                        index,
                                        cloneDeep(EMPTY_UI_FILTER)
                                      );
                                      form.setFieldValue(
                                        `filters.${index}.fieldInfo`,
                                        options
                                      );
                                    }}
                                    isInvalid={isInvalid(field.name, form)}
                                  />
                                </EuiFormRow>
                              )}
                            </Field>
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <Field name={`filters.${index}.operator`}>
                              {({ field, form }: FieldProps) => (
                                <EuiFormRow
                                  label="Operator"
                                  isInvalid={isInvalid(field.name, form)}
                                  error={getError(field.name, form)}
                                >
                                  <EuiSelect
                                    id={`filters.${index}.operator`}
                                    placeholder="Choose an operator"
                                    options={getOperators(
                                      get(
                                        values,
                                        `filters.${index}.fieldInfo.0.type`,
                                        DATA_TYPES.NUMBER
                                      )
                                    )}
                                    {...field}
                                  />
                                </EuiFormRow>
                              )}
                            </Field>
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </EuiFlexItem>
                      <EuiFlexItem grow={null}>
                        {isNullOperator(filter.operator) ? null : (
                          <FilterValue
                            dataType={get(
                              values,
                              `filters.${index}.fieldInfo.0.type`,
                              'number'
                            )}
                            index={index}
                            operator={filter.operator}
                            filterValues={filter}
                          />
                        )}
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiAccordion>
                </EuiPanel>
              );
            })}
            {values.filters.length === 0 ? (
              <div className="no-data-filter-rectangle">
                <EuiText>
                  <p className="no-data-filter-title">No data filter</p>
                </EuiText>
                <EuiSpacer size="s" />
                <EuiText>
                  <p className="sublabel-center">
                    Use data filter to reduce noisy data
                  </p>
                </EuiText>
                <EuiSpacer size="s" />
                <AddFilterButton unshift={unshift} />
              </div>
            ) : null}
          </EuiPanel>
        </Fragment>
      )}
    </FieldArray>
  );
};
