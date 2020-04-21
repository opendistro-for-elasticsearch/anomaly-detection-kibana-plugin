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

import React, { useState } from 'react';
import moment, { Moment } from 'moment';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiDatePickerRange,
  EuiDatePicker,
} from '@elastic/eui';

import { isToday, getRangeMaxTime } from './timeUtils';

const MAX_DAYS_ALLOWED_IN_RANGE = 5;

interface DateRangePickerProps {
  onRangeChange: (startTime: Moment, endTime: Moment) => void;
  initialStartTime: Moment;
  initialEndTime: Moment;
}

interface EuiStartDateProps {
  selected: Moment;
  minTime: Moment;
  maxTime: Moment;
  maxDate: Moment;
}

interface EuiEndDateProps {
  selected: Moment;
  minTime: Moment;
  maxTime: Moment;
  maxDate: Moment;
  injectTimes: Moment[];
}
interface DateRangePickerState {
  rangeStartDateTime: EuiStartDateProps;
  rangeEndDateTime: EuiEndDateProps;
}

const getEuiStartDateProps = (startDateTime: Moment): EuiStartDateProps => ({
  selected: startDateTime.isAfter(moment())
    ? moment().startOf('day')
    : startDateTime,
  minTime: startDateTime.clone().startOf('day'),
  maxTime: getRangeMaxTime(startDateTime),
  maxDate: moment(),
});

const getEuiEndDateProps = (
  startDateTime: Moment,
  endDateTime: Moment
): EuiEndDateProps => {
  const maxDate = startDateTime.clone().add(MAX_DAYS_ALLOWED_IN_RANGE, 'days');
  const now = moment();
  return {
    selected: endDateTime,
    minTime: endDateTime.clone().startOf('day'),
    maxTime: getRangeMaxTime(endDateTime),
    maxDate: maxDate > now ? now : maxDate,
    injectTimes: isToday(endDateTime) ? [now] : [],
  };
};

export const DateRangePicker = (props: DateRangePickerProps) => {
  const [dateRange, setDateRange] = useState<DateRangePickerState>({
    rangeStartDateTime: getEuiStartDateProps(props.initialStartTime),
    rangeEndDateTime: getEuiEndDateProps(
      props.initialStartTime,
      props.initialEndTime
    ),
  });
  const { rangeStartDateTime, rangeEndDateTime } = dateRange;
  const handleChangeStart = (startDateTime: Moment) => {
    setDateRange(state => {
      // If preselected endTime is out of range / grater than start update end time accordingly
      let endTime = state.rangeEndDateTime.selected;
      if (endTime.isSame(startDateTime)) {
        endTime = startDateTime.clone().add(30, 'm');
      } else if (
        endTime.isBefore(startDateTime) ||
        endTime.diff(startDateTime, 'days') > MAX_DAYS_ALLOWED_IN_RANGE
      ) {
        endTime = startDateTime.clone().add(1, 'd');
      }
      props.onRangeChange(startDateTime, endTime);
      return {
        rangeStartDateTime: {
          ...getEuiStartDateProps(startDateTime),
        },
        rangeEndDateTime: {
          ...getEuiEndDateProps(startDateTime, endTime),
        },
      };
    });
  };
  const handleChangeEnd = (endDateTime: Moment) => {
    setDateRange(({ rangeStartDateTime, rangeEndDateTime }) => {
      let startTime = rangeStartDateTime.selected;
      if (startTime.isSame(endDateTime)) {
        startTime = endDateTime.clone().subtract(30, 'm');
      } else if (startTime.isAfter(endDateTime)) {
        startTime = endDateTime.clone().subtract(30, 'm');
      }
      props.onRangeChange(startTime, endDateTime);
      return {
        rangeStartDateTime: {
          ...rangeStartDateTime,
          selected: startTime,
        },
        rangeEndDateTime: {
          ...rangeEndDateTime,
          selected: endDateTime,
        },
      };
    });
  };
  return (
    <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
      <EuiFlexItem grow={false}>
        <EuiDatePickerRange
          fullWidth
          startDateControl={
            //@ts-ignore
            <EuiDatePicker
              //@ts-ignore
              selected={rangeStartDateTime.selected}
              onChange={handleChangeStart}
              startDate={rangeStartDateTime.selected}
              endDate={rangeEndDateTime.selected}
              isInvalid={
                rangeStartDateTime.selected > rangeStartDateTime.selected
              }
              aria-label="Start date"
              showTimeSelect
              popperClassName="euiRangePicker--popper"
              shouldCloseOnSelect
              {...rangeStartDateTime}
            />
          }
          endDateControl={
            //@ts-ignore
            <EuiDatePicker
              //@ts-ignore
              selected={rangeEndDateTime.selected}
              onChange={handleChangeEnd}
              startDate={rangeStartDateTime.selected}
              endDate={rangeEndDateTime.selected}
              isInvalid={
                rangeStartDateTime.selected > rangeStartDateTime.selected
              }
              aria-label="End date"
              showTimeSelect
              popperClassName="calendar-range-pooper"
              shouldCloseOnSelect
              {...rangeEndDateTime}
            />
          }
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
