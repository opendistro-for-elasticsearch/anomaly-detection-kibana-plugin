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

import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { AddFilterButton } from '../AddFilterButton';

describe('<AddFilterButton /> spec', () => {
  test('renders action Filter button', () => {
    const mockedUnshift = jest.fn();
    const { getByText } = render(<AddFilterButton unshift={mockedUnshift} />);
    getByText('Add filter');
  });
  test('click should call props unshift', () => {
    const mockedUnshift = jest.fn();
    const { getByText } = render(<AddFilterButton unshift={mockedUnshift} />);
    fireEvent.click(getByText('Add filter'));
    expect(mockedUnshift).toHaveBeenCalled();
    expect(mockedUnshift).toHaveBeenCalledTimes(1);
  });
});
