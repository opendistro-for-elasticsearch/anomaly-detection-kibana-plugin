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
import { EmptyDetectorMessage } from '../EmptyMessage';

describe('<EmptyDetectorMessage /> spec', () => {
  describe('Empty results', () => {
    test('renders component with empty message', () => {
      const { container, getByText } = render(
        <EmptyDetectorMessage
          isFilterApplied={false}
          onResetFilters={jest.fn()}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
      getByText('Create detector');
    });
  });
  describe('Filters results message', () => {
    test('renders component no result for filters message', () => {
      const { container } = render(
        <EmptyDetectorMessage
          isFilterApplied={true}
          onResetFilters={jest.fn()}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
    test('resets filters when click on reset filters', () => {
      const handleResetFilters = jest.fn();
      const { getByTestId } = render(
        <EmptyDetectorMessage
          isFilterApplied={true}
          onResetFilters={handleResetFilters}
        />
      );
      fireEvent.click(getByTestId('resetListFilters'));
      expect(handleResetFilters).toHaveBeenCalled();
      expect(handleResetFilters).toHaveBeenCalledTimes(1);
    });
  });
});
