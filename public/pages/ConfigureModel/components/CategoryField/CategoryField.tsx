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
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiLink,
  EuiIcon,
  EuiFormRow,
  EuiComboBox,
  EuiCheckbox,
  EuiTitle,
  EuiCallOut,
  EuiSpacer,
} from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import { get, isEmpty } from 'lodash';
import { MULTI_ENTITY_SHINGLE_SIZE } from '../../../../utils/constants';
import React, { useState, useEffect } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import {
  isInvalid,
  getError,
  validateCategoryField,
} from '../../../../utils/utils';
import { ModelConfigurationFormikValues } from '../../models/interfaces';

interface CategoryFieldProps {
  isEdit: boolean;
  isHCDetector: boolean;
  categoryFieldOptions: string[];
  setIsHCDetector(isHCDetector: boolean): void;
  isLoading: boolean;
  originalShingleSize: number;
  formikProps: FormikProps<ModelConfigurationFormikValues>;
}

export function CategoryField(props: CategoryFieldProps) {
  const [enabled, setEnabled] = useState<boolean>(
    get(props, 'formikProps.values.categoryFieldEnabled', false)
  );
  const noCategoryFields = isEmpty(props.categoryFieldOptions);
  const convertedOptions = props.categoryFieldOptions.map((option: string) => {
    return {
      label: option,
    };
  });

  useEffect(() => {
    // only update this if we're editing and the detector has finally come
    if (props.isEdit) {
      setEnabled(props.isHCDetector);
    }
  }, [props.isHCDetector]);

  return (
    <ContentPanel
      title={
        <EuiTitle size="s" id={'categoryFieldTitle'}>
          <h2>Categorical field </h2>
        </EuiTitle>
      }
      subTitle={
        <EuiText className="content-panel-subTitle">
          Categorize anomalies based on unique partitions. For example, with
          clickstream data you can categorize anomalies into a given day, week,
          or month.{' '}
          <EuiLink
            href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
            target="_blank"
          >
            Learn more <EuiIcon size="s" type="popout" />
          </EuiLink>
        </EuiText>
      }
    >
      {noCategoryFields && !props.isLoading ? (
        <EuiCallOut
          data-test-subj="noCategoryFieldsCallout"
          title="There are no available category fields for the selected index"
          color="warning"
          iconType="alert"
        ></EuiCallOut>
      ) : null}
      {noCategoryFields ? <EuiSpacer size="m" /> : null}
      <Field
        name="categoryField"
        validate={enabled ? validateCategoryField : null}
      >
        {({ field, form }: FieldProps) => (
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiCheckbox
                id={'categoryFieldCheckbox'}
                label="Enable categorical field"
                checked={enabled}
                disabled={noCategoryFields}
                onChange={() => {
                  if (!enabled) {
                    props.setIsHCDetector(true);
                  }
                  if (enabled) {
                    props.setIsHCDetector(false);
                    form.setFieldValue('categoryField', []);
                    form.setFieldValue(
                      'shingleSize',
                      props.originalShingleSize
                    );
                  }
                  setEnabled(!enabled);
                }}
              />
            </EuiFlexItem>
            {enabled && !noCategoryFields ? (
              <EuiFlexItem>
                <EuiFormRow
                  label="Field"
                  isInvalid={isInvalid(field.name, form)}
                  error={getError(field.name, form)}
                  helpText={`You can only apply the category field to the 'ip' and 'keyword' Elasticsearch data types.`}
                >
                  <EuiComboBox
                    data-test-subj="categoryFieldComboBox"
                    id="categoryField"
                    placeholder="Select your category field"
                    options={convertedOptions}
                    onBlur={() => {
                      form.setFieldTouched('categoryField', true);
                    }}
                    onChange={(options) => {
                      const selection = get(options, '0.label');
                      if (selection) {
                        form.setFieldValue('categoryField', [selection]);
                        form.setFieldValue(
                          'shingleSize',
                          MULTI_ENTITY_SHINGLE_SIZE
                        );
                      } else {
                        form.setFieldValue('categoryField', []);

                        form.setFieldValue(
                          'shingleSize',
                          props.originalShingleSize
                        );
                      }
                    }}
                    selectedOptions={
                      (field.value[0] && [{ label: field.value[0] }]) || []
                    }
                    singleSelection={{ asPlainText: true }}
                    isClearable={true}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
        )}
      </Field>
    </ContentPanel>
  );
}
