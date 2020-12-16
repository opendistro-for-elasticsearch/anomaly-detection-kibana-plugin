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

import { EuiSuperDatePicker } from '@elastic/eui';
import { Field, FieldProps } from 'formik';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { FormattedFormRow } from '../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { getError, isInvalid } from '../../../../utils/utils';
import { HISTORICAL_DETCTOR_DATE_RANGE_COMMON_OPTIONS } from '../../utils/constants';
import { convertTimestampToString } from '../../utils/helpers';

interface TimeRangeProps {
  isLoading: boolean;
}

export function TimeRange(props: TimeRangeProps) {
  return (
    <ContentPanel title="Time range" titleSize="s">
      <Field name="dateRange">
        {({ field, form }: FieldProps) => (
          <FormattedFormRow
            title="Time range for historical analysis "
            hint="Choose a time range for your historical data analysis."
            isInvalid={isInvalid(field.name, form)}
            error={getError(field.name, form)}
          >
            <EuiSuperDatePicker
              isLoading={props.isLoading}
              start={convertTimestampToString(form.values.startTime)}
              end={convertTimestampToString(form.values.endTime)}
              onTimeChange={({ start, end, isInvalid, isQuickSelection }) => {
                form.setFieldValue('startTime', start);
                form.setFieldValue('endTime', end);
                form.setFieldValue('rangeValid', !isInvalid);
              }}
              isPaused={true}
              showUpdateButton={false}
              commonlyUsedRanges={HISTORICAL_DETCTOR_DATE_RANGE_COMMON_OPTIONS}
            />
          </FormattedFormRow>
        )}
      </Field>
    </ContentPanel>
  );
}
