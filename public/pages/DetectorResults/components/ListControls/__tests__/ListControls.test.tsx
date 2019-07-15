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
import { render, fireEvent } from '@testing-library/react';
import { ListControls } from '../ListControls';

describe('<ListControls /> spec', () => {
  const defaultProps = {
    activePage: 1,
    pageCount: 10,
    search: '',
    onSearchChange: jest.fn(),
    onPageClick: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Empty results', () => {
    test('renders component with empty message', async () => {
      const { container } = render(<ListControls {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });
    test('pagination should be hidden if pages count is 1', async () => {
      const { queryByTestId } = render(
        <ListControls {...defaultProps} pageCount={1} />
      );
      expect(queryByTestId('anomaliesPageControls')).toBeNull();
    });
    test('pagination should be visible if pages count more than 1', async () => {
      const { queryByTestId } = render(
        <ListControls {...defaultProps} pageCount={2} />
      );
      expect(queryByTestId('anomaliesPageControls')).not.toBeNull();
    });
    test('should call onPageClick when click on the page', async () => {
      const { getByTestId } = render(<ListControls {...defaultProps} />);
      fireEvent.click(getByTestId('pagination-button-3'));
      expect(defaultProps.onPageClick).toHaveBeenCalledTimes(1);
    });
  });
});
