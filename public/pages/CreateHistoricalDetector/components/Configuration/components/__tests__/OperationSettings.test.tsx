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

import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import { OperationSettings } from '../OperationSettings/OperationSettings';
import { Formik } from 'formik';
import userEvent from '@testing-library/user-event';

const TITLE_TEXT = 'Operation settings';
const INTERVAL_TEXT = 'Detection interval';
const RUN_DETECTOR_TEXT = 'Run detector automatically after creating';
const INVALID_TEXT = 'Must be a positive integer';

const onOptionChange = jest.fn();

const renderWithFormik = () => ({
  ...render(
    <Formik initialValues={{}} onSubmit={jest.fn()}>
      {() => (
        <div>
          <OperationSettings
            formikProps={{
              setFieldValue: jest.fn(),
              setFieldTouched: jest.fn(),
            }}
            onOptionChange={onOptionChange}
          />
        </div>
      )}
    </Formik>
  ),
});

describe('<OperationSettings /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component', () => {
    const { container, getByText, queryByText } = renderWithFormik();
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
    getByText(INTERVAL_TEXT);
    getByText(RUN_DETECTOR_TEXT);
    expect(queryByText(INVALID_TEXT)).toBeNull();
  });
  test('allows changing to another valid number', async () => {
    const { getByText, queryByText, getByPlaceholderText } = renderWithFormik();
    userEvent.type(getByPlaceholderText('Detector interval'), '1');
    fireEvent.blur(getByPlaceholderText('Detector interval'));
    await wait();
    getByText(TITLE_TEXT);
    expect(queryByText(INVALID_TEXT)).toBeNull();
  });
  test('catches invalid interval of 0', async () => {
    const { getByText, getByPlaceholderText } = renderWithFormik();
    userEvent.type(getByPlaceholderText('Detector interval'), '0');
    fireEvent.blur(getByPlaceholderText('Detector interval'));
    await wait();
    getByText(TITLE_TEXT);
    getByText(INVALID_TEXT);
  });
  test('catches invalid interval of -1', async () => {
    const { getByText, getByPlaceholderText } = renderWithFormik();
    userEvent.type(getByPlaceholderText('Detector interval'), '-1');
    fireEvent.blur(getByPlaceholderText('Detector interval'));
    await wait();
    getByText(TITLE_TEXT);
    getByText(INVALID_TEXT);
  });
  test('catches invalid interval that is non-numeric', async () => {
    const { getByText, getByPlaceholderText } = renderWithFormik();
    userEvent.type(getByPlaceholderText('Detector interval'), 'test');
    fireEvent.blur(getByPlaceholderText('Detector interval'));
    await wait();
    getByText(TITLE_TEXT);
    getByText(INVALID_TEXT);
  });
  test('changing the run option calls onOptionChange', () => {
    const { getByText } = renderWithFormik();
    expect(onOptionChange).toHaveBeenCalledTimes(0);
    fireEvent.click(getByText('Run detector automatically after creating'));
    expect(onOptionChange).toHaveBeenCalledTimes(1);
  });
});
