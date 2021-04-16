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
  EuiTitle,
  EuiFieldNumber,
} from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React, { useState } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import {
  isInvalid,
  getError,
  validatePositiveInteger,
} from '../../../../utils/utils';

interface AdvancedSettingsProps {}

export function AdvancedSettings(props: AdvancedSettingsProps) {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(
    false
  );

  return (
    <ContentPanel
      title={
        <EuiTitle size="s">
          <h2>Advanced settings </h2>
        </EuiTitle>
      }
      subTitle={
        <EuiText
          className="content-panel-subTitle"
          onClick={() => {
            setShowAdvancedSettings(!showAdvancedSettings);
          }}
        >
          <EuiLink>{showAdvancedSettings ? 'Hide' : 'Show'}</EuiLink>
        </EuiText>
      }
    >
      {showAdvancedSettings ? (
        <Field name="shingleSize" validate={validatePositiveInteger}>
          {({ field, form }: FieldProps) => (
            <EuiFormRow
              label="Window size"
              helpText={
                <EuiText className="content-panel-subTitle">
                  Set the number of intervals to consider in a detection window.
                  We recommend you choose this value based on your actual data.
                  If you expect missing values in your data or if you want the
                  anomalies based on the current interval, choose 1. If your
                  data is continuously ingested and you want the anomalies based
                  on multiple intervals, choose a larger window size.{' '}
                  <EuiLink
                    href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
                    target="_blank"
                  >
                    Learn more <EuiIcon size="s" type="popout" />
                  </EuiLink>
                </EuiText>
              }
              isInvalid={isInvalid(field.name, form)}
              error={getError(field.name, form)}
            >
              <EuiFlexGroup gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiFieldNumber
                    id="shingleSize"
                    placeholder="Window size"
                    data-test-subj="shingleSize"
                    {...field}
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText>
                    <p className="minutes">intervals</p>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFormRow>
          )}
        </Field>
      ) : null}
    </ContentPanel>
  );
}
