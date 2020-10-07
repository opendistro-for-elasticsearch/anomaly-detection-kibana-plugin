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
  EuiCallOut,
  EuiSpacer,
} from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import { get, isEmpty } from 'lodash';
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
  const noCategoryFields = isEmpty(props.categoryFieldOptions);
  const convertedOptions = props.categoryFieldOptions.map((option: string) => {
    return {
      label: option,
    };
  });

  useEffect(() => {
    setEnabled(props.isHCDetector || enabled);
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
              Categorize anomalies based on unique partitions. For example, with
              clickstream data you can categorize anomalies into a given day,
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
          {noCategoryFields ? (
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
            // validate={enabled && true ? requiredNonEmptyArray : null}
            validate={requiredNonEmptyArray}
          >
            {({ field, form }: FieldProps) => (
              <EuiFlexGroup direction="column">
                <EuiFlexItem>
                  <EuiCheckbox
                    id={'categoryFieldCheckbox'}
                    label="Enable category field"
                    checked={enabled}
                    disabled={noCategoryFields}
                    onChange={() => {
                      // If user is now enabling: set the field touched to perform validation
                      if (!enabled) {
                        form.setFieldTouched('categoryField', false);
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
                {enabled && !noCategoryFields ? (
                  <EuiFlexItem>
                    <EuiFormRow
                      label="Field"
                      isInvalid={isInvalid(field.name, form)}
                      error={getError(field.name, form)}
                      helpText={`The category field can only be applied to the "ip" and "keyword" elasticsearch data types.`}
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
                            console.log('selected field', selection);
                            props.onCategoryFieldSelected([selection]);
                          } else {
                            form.setFieldValue('categoryField', []);
                            props.onCategoryFieldSelected([]);
                            setEnabled(true);
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
