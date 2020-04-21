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

import React from 'react';
import moment from 'moment';
import { DateRangePicker } from '../DateRangePicker';
import { render, waitForElement } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// jest.mock('moment', () => () => ({format: () => '2018–01–30T12:34:56+00:00'}));
let scrollIntoViewMock = jest.fn();
//@ts-ignore
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;
window.document.createRange = jest.fn().mockReturnValue({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

describe('<DateRangePicker/>', () => {
  const initialStartTime = moment('2019-10-20T09:00:00');
  const initialEndTime = initialStartTime.clone().add(5, 'd');
  test('should initialize with initial start and end time', () => {
    const { getByDisplayValue } = render(
      <DateRangePicker
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onRangeChange={jest.fn()}
      />
    );
    getByDisplayValue('10/20/2019 09:00 AM');
    getByDisplayValue('10/25/2019 09:00 AM');
  });
  test('should able to change  end date', async () => {
    const { getByDisplayValue, getByText } = render(
      <DateRangePicker
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onRangeChange={jest.fn()}
      />
    );
    userEvent.click(getByDisplayValue('10/25/2019 09:00 AM'));
    const date = await waitForElement(() => getByText('22'));
    userEvent.click(date);
    getByDisplayValue('10/22/2019 09:00 AM');
  });
  test('outside range dates should be disabled', () => {
    const { getByDisplayValue, container } = render(
      <DateRangePicker
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onRangeChange={jest.fn()}
      />
    );
    userEvent.click(getByDisplayValue('10/25/2019 09:00 AM'));
    expect(
      container.querySelectorAll('.react-datepicker__day--disabled').length
    ).toEqual(8);
  });
  describe('start date change', () => {
    test('should not change end date', async () => {
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      //open startDate picker
      userEvent.click(getByDisplayValue('10/20/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('22'));
      userEvent.click(date);
      //Updated start date
      getByDisplayValue('10/22/2019 09:00 AM');
      //End date shouldn't be changed
      getByDisplayValue('10/22/2019 09:00 AM');
    });
    test('should change end date due to out of range', async () => {
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      //open startDate picker
      userEvent.click(getByDisplayValue('10/20/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('10'));
      userEvent.click(date);
      //Updated start date
      getByDisplayValue('10/10/2019 09:00 AM');
      //End date range should be updated
      getByDisplayValue('10/11/2019 09:00 AM');
    });
    test('should change end time for same start date', async () => {
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      //open startDate picker
      userEvent.click(getByDisplayValue('10/20/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('25'));
      userEvent.click(date);
      //Updated start date
      getByDisplayValue('10/25/2019 09:00 AM');
      //End date range should be updated
      getByDisplayValue('10/25/2019 09:30 AM');
    });
    test('should change end date for startdate is after current end date', async () => {
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      //open startDate picker
      userEvent.click(getByDisplayValue('10/20/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('27'));
      userEvent.click(date);
      //Updated start date
      getByDisplayValue('10/27/2019 09:00 AM');
      //End date range should be updated
      getByDisplayValue('10/28/2019 09:00 AM');
    });
    test('should call onRangeChange onChange', async () => {
      const mockedHandleRangeChange = jest.fn();
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={mockedHandleRangeChange}
        />
      );
      //open startDate picker
      userEvent.click(getByDisplayValue('10/20/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('21'));
      userEvent.click(date);
      expect(mockedHandleRangeChange).toHaveBeenCalledTimes(1);
    });
  });
  describe('end date change', () => {
    test('should not change start date', async () => {
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      //open endDate picker
      userEvent.click(getByDisplayValue('10/25/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('24'));
      userEvent.click(date);
      //start date shouldn't be changed
      getByDisplayValue('10/20/2019 09:00 AM');
      //End date
      getByDisplayValue('10/24/2019 09:00 AM');
    });
    test('should change start date due to out of range', async () => {
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      //open endDate picker
      userEvent.click(getByDisplayValue('10/25/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('15'));
      userEvent.click(date);
      //Updated start date
      getByDisplayValue('10/15/2019 08:30 AM');
      //End date
      getByDisplayValue('10/15/2019 09:00 AM');
    });
    test('should change start date for selecting same date as Start date ', async () => {
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={jest.fn()}
        />
      );
      //open endDate picker
      userEvent.click(getByDisplayValue('10/25/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('20'));
      userEvent.click(date);
      //Updated start date
      getByDisplayValue('10/20/2019 08:30 AM');
      //End date
      getByDisplayValue('10/20/2019 09:00 AM');
    });
    test('should call onRangeChange onChange', async () => {
      const mockedHandleRangeChange = jest.fn();
      const { getByDisplayValue, getByText } = render(
        <DateRangePicker
          initialStartTime={initialStartTime}
          initialEndTime={initialEndTime}
          onRangeChange={mockedHandleRangeChange}
        />
      );
      //open endDate picker
      userEvent.click(getByDisplayValue('10/25/2019 09:00 AM'));
      const date = await waitForElement(() => getByText('24'));
      userEvent.click(date);
      expect(mockedHandleRangeChange).toHaveBeenCalledTimes(1);
    });
  });
});
