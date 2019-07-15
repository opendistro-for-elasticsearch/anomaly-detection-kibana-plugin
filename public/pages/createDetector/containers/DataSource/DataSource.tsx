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

import { EuiComboBox, EuiFormRow, EuiSelect, EuiText } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { debounce, get } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CatIndex, IndexAlias } from '../../../../../server/models/types';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../../redux/reducers';
import {
  getIndices,
  getMappings,
  getPrioritizedIndices,
} from '../../../../redux/reducers/elasticsearch';
import { getError, isInvalid, required } from '../../../../utils/utils';
import { IndexOption } from '../../components/Datasource/IndexOption';
import { getVisibleOptions, sanitizeSearchText } from './utils/helpers';
import { validateIndex } from './utils/validate';

function DataSource() {
  const dispatch = useDispatch();
  const [queryText, setQueryText] = useState('');
  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );
  useEffect(() => {
    const getInitialIndices = async () => {
      await dispatch(getIndices(queryText));
    };
    getInitialIndices();
  }, []);

  const handleSearchChange = debounce(async (searchValue: string) => {
    if (searchValue !== queryText) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setQueryText(sanitizedQuery);
      await dispatch(getPrioritizedIndices(sanitizedQuery));
    }
  }, 300);

  const handleChange = (selectedOptions: any) => {
    const indexName = get(selectedOptions, '0.label', '');
    if (indexName !== '') {
      dispatch(getMappings(indexName));
    }
  };

  const dateFields = Array.from(get(
    elasticsearchState,
    'dataTypes.date',
    []
  ) as string[]);
  const timeStampFieldOptions = ['']
    .concat(dateFields)
    .map(dateField => ({ value: dateField, text: dateField }));
  const visibleIndices = get(elasticsearchState, 'indices', []) as CatIndex[];
  const visibleAliases = get(elasticsearchState, 'aliases', []) as IndexAlias[];

  return (
    <ContentPanel title="Datasource" titleSize="s">
      <EuiFormRow>
        <EuiText size="s">
          Anomaly detector uses an index or an index pattern as the datasource.
        </EuiText>
      </EuiFormRow>
      <Field name="index" validate={validateIndex}>
        {({ field, form }: FieldProps) => {
          return (
            <EuiFormRow
              label="Index"
              isInvalid={isInvalid(field.name, form)}
              error={getError(field.name, form)}
              helpText="You can use a wildcard (*) in your index pattern"
            >
              <EuiComboBox
                id="index"
                placeholder="Find indices"
                async
                isLoading={elasticsearchState.requesting}
                options={getVisibleOptions(visibleIndices, visibleAliases)}
                onSearchChange={handleSearchChange}
                onCreateOption={(createdOption: string) => {
                  const normalizedOptions = createdOption.trim().toLowerCase();
                  if (!normalizedOptions) return;
                  const customOption = [{ label: normalizedOptions }];
                  form.setFieldValue('index', customOption);
                  handleChange(customOption);
                }}
                onBlur={() => {
                  form.setFieldTouched('index', true);
                }}
                onChange={options => {
                  form.setFieldValue('index', options);
                  handleChange(options);
                }}
                selectedOptions={field.value}
                singleSelection={true}
                isClearable={false}
                renderOption={(option, searchValue, className) => (
                  <IndexOption
                    option={option}
                    searchValue={searchValue}
                    contentClassName={className}
                  />
                )}
              />
            </EuiFormRow>
          );
        }}
      </Field>
      <Field name="timeField" validate={required}>
        {({ field, form }: FieldProps) => (
          <EuiFormRow
            label="Timestamp field"
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
            helpText="Choose the time field you want to use for time filter"
          >
            <EuiSelect
              {...field}
              id="timeField"
              placeholder="Choose timestamp field"
              options={timeStampFieldOptions}
            />
          </EuiFormRow>
        )}
      </Field>
    </ContentPanel>
  );
}

export default DataSource;
