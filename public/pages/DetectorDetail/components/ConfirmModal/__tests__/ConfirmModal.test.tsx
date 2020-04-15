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
import { render } from '@testing-library/react';
import { ConfirmModal } from '../ConfirmModal';

describe('<ConfirmModal /> spec', () => {
  const onClose = jest.fn();
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const component = <div>mock component</div>;
  describe('Confirm Modal', () => {
    test('renders component with callout', () => {
      const { container } = render(
        <ConfirmModal
          title="test confirm modal"
          description="this is a testing description"
          callout="test callout"
          confirmButtonText=""
          confirmButtonColor="primary"
          onClose={onClose}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      );
      expect(container).toMatchSnapshot();
    });

    test('renders component with empty callout', () => {
      const { container } = render(
        <ConfirmModal
          title="test confirm modal"
          description="this is a testing description"
          confirmButtonText=""
          confirmButtonColor="primary"
          onClose={onClose}
          onCancel={onCancel}
          onConfirm={onConfirm}
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
