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
import { render, fireEvent } from '@testing-library/react';
import { Info } from '../Info';
import { Formik } from 'formik';

const MOCK_INVALID_NAME = 'Invalid detector name';
const MOCK_INVALID_DESCRIPTION = 'Invalid detector description';

const mockValidateDescription = jest.fn().mockImplementation(() => {
  return MOCK_INVALID_DESCRIPTION;
});
const mockValidateName = jest.fn().mockImplementation(() => {
  return MOCK_INVALID_NAME;
});

describe('<Info /> spec', () => {
  test('renders the component', () => {
    const { container } = render(
      <Formik initialValues={{ detectorName: '' }} onSubmit={jest.fn()}>
        {() => (
          <div>
            <Info
              onValidateDetectorName={jest.fn()}
              onValidateDetectorDescription={jest.fn()}
            />
          </div>
        )}
      </Formik>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  test('shows error for invalid detector name input', async () => {
    const { queryByText, findByText, getByPlaceholderText } = render(
      <Formik
        initialValues={{ detectorName: '', detectorDescription: '' }}
        onSubmit={jest.fn()}
      >
        {() => (
          <div>
            <Info
              onValidateDetectorName={mockValidateName}
              onValidateDetectorDescription={jest.fn()}
            />
          </div>
        )}
      </Formik>
    );
    expect(queryByText(MOCK_INVALID_NAME)).toBeNull();
    fireEvent.focus(getByPlaceholderText('Enter detector name'));
    fireEvent.blur(getByPlaceholderText('Enter detector name'));
    expect(findByText(MOCK_INVALID_NAME)).not.toBeNull();
  });
  test('shows error for invalid detector description', async () => {
    const { queryByText, findByText, getByPlaceholderText } = render(
      <Formik
        initialValues={{ detectorName: '', detectorDescription: '' }}
        onSubmit={jest.fn()}
      >
        {() => (
          <div>
            <Info
              onValidateDetectorName={jest.fn()}
              onValidateDetectorDescription={mockValidateDescription}
            />
          </div>
        )}
      </Formik>
    );
    expect(queryByText(MOCK_INVALID_DESCRIPTION)).toBeNull();
    fireEvent.focus(getByPlaceholderText('Enter detector description'));
    fireEvent.blur(getByPlaceholderText('Enter detector description'));
    expect(findByText(MOCK_INVALID_DESCRIPTION)).not.toBeNull();
  });
});
