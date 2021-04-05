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
  EuiText,
  EuiLink,
  EuiIcon,
  EuiFlexItem,
  EuiFlexGroup,
  EuiCheckbox,
  EuiSuperDatePicker,
} from '@elastic/eui';
import { Field, FieldProps, FormikProps } from 'formik';
import { get } from 'lodash';
import React, { useState } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { FormattedFormRow } from '../../../../components/FormattedFormRow/FormattedFormRow';
import { DetectorJobsFormikValues } from '../../models/interfaces';
import { HISTORICAL_DATE_RANGE_COMMON_OPTIONS } from '../../utils/constants';
import {
  isInvalid,
  getError,
  convertTimestampToString,
} from '../../../../utils/utils';

interface HistoricalJobProps {
  formikProps: FormikProps<DetectorJobsFormikValues>;
  historical: boolean;
  setHistorical(historical: boolean): void;
}
export function HistoricalJob(props: HistoricalJobProps) {
  const [enabled, setEnabled] = useState<boolean>(
    get(props, 'formikProps.values.historical', true)
  );

  return (
    <ContentPanel
      title="Historical analysis detection"
      titleSize="s"
      subTitle={
        <EuiText className="content-panel-subTitle">
          Historical analysis detection lets you analyze and apply machine
          learning models over long historical data windows (weeks, months). You
          can identify anomaly patterns, seasonality, and trends.{' '}
          <EuiLink
            href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
            target="_blank"
          >
            Learn more <EuiIcon size="s" type="popout" />
          </EuiLink>
        </EuiText>
      }
    >
      <Field name="historical">
        {({ field, form }: FieldProps) => (
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiCheckbox
                id={'historicalCheckbox'}
                label="Run historical analysis detection"
                checked={enabled}
                onChange={() => {
                  if (!enabled) {
                    props.setHistorical(true);
                  }
                  if (enabled) {
                    props.setHistorical(false);
                  }
                  setEnabled(!enabled);
                }}
              />
            </EuiFlexItem>
            {enabled ? (
              <EuiFlexItem>
                <FormattedFormRow
                  title="Historical analysis date range"
                  helpText="Select a date range for your historical analysis (you may adjust later)."
                  isInvalid={isInvalid(field.name, form)}
                  error={getError(field.name, form)}
                >
                  <EuiSuperDatePicker
                    //isLoading={props.isLoading}
                    start={convertTimestampToString(form.values.startTime)}
                    end={convertTimestampToString(form.values.endTime)}
                    onTimeChange={({
                      start,
                      end,
                      isInvalid,
                      isQuickSelection,
                    }) => {
                      form.setFieldValue('startTime', start);
                      form.setFieldValue('endTime', end);
                    }}
                    isPaused={true}
                    showUpdateButton={false}
                    commonlyUsedRanges={HISTORICAL_DATE_RANGE_COMMON_OPTIONS}
                  />
                </FormattedFormRow>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
        )}
      </Field>
    </ContentPanel>
  );
}
