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

import { EuiComboBox, EuiCallOut, EuiSpacer, EuiText } from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import { debounce, get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { AppState } from '../../../../redux/reducers';
import { getPrioritizedIndices } from '../../../../redux/reducers/elasticsearch';
import { FormattedFormRow } from '../../../../components/FormattedFormRow/FormattedFormRow';
import { sanitizeSearchText } from '../../../utils/helpers';
import { getError, isInvalid, required } from '../../../../utils/utils';
import { DetectorDefinitionFormikValues } from '../../models/interfaces';

interface TimestampProps {
  formikProps: FormikProps<DetectorDefinitionFormikValues>;
}

export function Timestamp(props: TimestampProps) {
  const dispatch = useDispatch();
  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );
  const selectedIndex = get(props, 'formikProps.values.index.0.label', '');
  const isRemoteIndex = selectedIndex.includes(':');
  const [queryText, setQueryText] = useState('');

  const handleSearchChange = debounce(async (searchValue: string) => {
    if (searchValue !== queryText) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setQueryText(sanitizedQuery);
      await dispatch(getPrioritizedIndices(sanitizedQuery));
    }
  }, 300);

  const dateFields = Array.from(
    get(elasticsearchState, 'dataTypes.date', []) as string[]
  );

  const timeStampFieldOptions = isEmpty(dateFields)
    ? []
    : dateFields.map((dateField) => ({ label: dateField }));

  return (
    <ContentPanel
      title="Timestamp"
      titleSize="s"
      subTitle={
        <EuiText className="content-panel-subTitle">
          Select the time field you want to use for the time filter.
        </EuiText>
      }
    >
      {isRemoteIndex ? (
        <div>
          <EuiCallOut
            title="A remote index is selected, so you need to manually input the time field."
            color="warning"
            iconType="alert"
            size="s"
          />
          <EuiSpacer size="m" />
        </div>
      ) : null}
      <Field name="timeField" validate={required}>
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            title="Timestamp field"
            hint="Choose the time field you want to use for time filter."
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiComboBox
              id="timeField"
              placeholder="Find timestamp"
              options={timeStampFieldOptions}
              onSearchChange={handleSearchChange}
              onCreateOption={(createdOption: string) => {
                const normalizedOptions = createdOption.trim();
                if (!normalizedOptions) return;
                form.setFieldValue('timeField', normalizedOptions);
              }}
              onBlur={() => {
                form.setFieldTouched('timeField', true);
              }}
              onChange={(options) => {
                form.setFieldValue('timeField', get(options, '0.label'));
              }}
              selectedOptions={(field.value && [{ label: field.value }]) || []}
              singleSelection={{ asPlainText: true }}
              isClearable={false}
            />
          </FormattedFormRow>
        )}
      </Field>
    </ContentPanel>
  );
}
