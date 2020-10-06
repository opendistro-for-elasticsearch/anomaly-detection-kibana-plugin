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

import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiText,
  EuiLink,
  EuiIcon,
  EuiFormRow,
  EuiPage,
  EuiPageBody,
  EuiComboBox,
  EuiCheckbox,
  EuiTitle,
} from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { get } from 'lodash';
import React, { useState, useEffect } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  isInvalid,
  getError,
  requiredNonEmptyArray,
} from '../../../../utils/utils';
//@ts-ignore
import chrome from 'ui/chrome';

interface CategoryFieldProps {
  isHCDetector: boolean;
  categoryFieldOptions: string[];
  onCategoryFieldSelected(categoryField: string[]): void;
}

export function CategoryField(props: CategoryFieldProps) {
  const [enabled, setEnabled] = useState<boolean>(props.isHCDetector);
  const convertedOptions = props.categoryFieldOptions.map((option: string) => {
    return {
      label: option,
    };
  });

  useEffect(() => {
    setEnabled(props.isHCDetector);
  }, [props.isHCDetector]);

  return (
    <EuiPage>
      <EuiPageBody>
        <ContentPanel
          title={
            <EuiTitle size="s">
              <h2>
                Category field{' '}
                <span
                  style={{
                    fontFamily: 'Helvetica',
                    fontStyle: 'italic',
                    color: '#16191f',
                  }}
                >
                  - optional
                </span>{' '}
              </h2>
            </EuiTitle>
          }
          subTitle={
            <EuiText className="content-panel-subTitle">
              Categorize anomalies based on unique partitions. For example, for
              clickstream data, you can categorize anomalies into a given day,
              week, or month.{' '}
              <EuiLink
                href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
                target="_blank"
              >
                Learn more <EuiIcon size="s" type="popout" />
              </EuiLink>
            </EuiText>
          }
        >
          <Field
            name="categoryField"
            validate={enabled ? requiredNonEmptyArray : null}
          >
            {({ field, form }: FieldProps) => (
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <EuiCheckbox
                    id={'categoryFieldCheckbox'}
                    label="Enable category field"
                    checked={enabled}
                    onChange={() => {
                      // If user is now enabling: set the field touched to perform validation
                      if (!enabled) {
                        form.setFieldTouched('categoryField', true);
                      }
                      // If the user is now disabling: set the field to null
                      if (enabled) {
                        form.setFieldValue('categoryField', []);
                        props.onCategoryFieldSelected([]);
                      }
                      setEnabled(!enabled);
                    }}
                  />
                </EuiFlexItem>
                {enabled ? (
                  <EuiFlexItem>
                    <EuiFormRow
                      label="Field"
                      isInvalid={isInvalid(field.name, form)}
                      error={getError(field.name, form)}
                    >
                      <EuiComboBox
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
                            console.log('selected field', selection);
                            props.onCategoryFieldSelected([selection]);
                          } else {
                            form.setFieldValue('categoryField', []);
                            props.onCategoryFieldSelected([]);
                          }
                        }}
                        selectedOptions={
                          (field.value[0] && [{ label: field.value[0] }]) || []
                        }
                        singleSelection={true}
                        isClearable={true}
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                ) : null}
              </EuiFlexGroup>
            )}
          </Field>
        </ContentPanel>
      </EuiPageBody>
    </EuiPage>
  );
}
