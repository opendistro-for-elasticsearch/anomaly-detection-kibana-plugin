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
import { Provider } from 'react-redux';
import {
  HashRouter as Router,
  RouteComponentProps,
  Route,
  Switch,
} from 'react-router-dom';
import { render, fireEvent, wait } from '@testing-library/react';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { CreateDetector } from '../CreateDetector';
import { getRandomDetector } from '../../../../redux/reducers/__tests__/utils';
import configureStore from '../../../../redux/configureStore';
import { httpClientMock } from '../../../../../test/mocks';
import userEvent from '@testing-library/user-event';

const renderWithRouter = (isEdit: boolean = false) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => (
              <CreateDetector isEdit={isEdit} {...props} />
            )}
          />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<CreateDetector /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('create detector', () => {
    test('renders the component', () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            indices: [
              { index: 'hello', health: 'green' },
              { index: 'world', health: 'yellow' },
            ],
          },
        },
      });
      const { container } = renderWithRouter();
      expect(container.firstChild).toMatchSnapshot();
    });

    test('validate all required field', async () => {
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            indices: [
              { index: 'hello', health: 'green' },
              { index: 'world', health: 'yellow' },
            ],
          },
        },
      });
      const { getByText } = renderWithRouter();
      fireEvent.click(getByText('Create'));
      await wait(() => {
        getByText('Required');
        getByText('Must specify an index');
      });
    });

    test('prevent duplicate detector name', async () => {
      const randomDetector = getRandomDetector();
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: { count: 0, match: true },
        },
      });
      const { getByPlaceholderText, getByText } = renderWithRouter();
      fireEvent.focus(getByPlaceholderText('Enter detector name'));
      userEvent.type(
        getByPlaceholderText('Enter detector name'),
        randomDetector.name
      );
      fireEvent.blur(getByPlaceholderText('Enter detector name'));
      await wait(() => {
        getByText('Duplicate detector name');
      });
    });
    //There are some issues / bug with Combobox and unable to select item
    it.skip('should create detector with all valid values', async () => {
      const randomDetector = getRandomDetector();
      //Mocked name validation search detector
      httpClientMock.post = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: { detectors: [randomDetector], totalDetectors: 1 },
        },
      });
      //Mocked get indices
      httpClientMock.get = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            indices: [
              { index: 'hello', health: 'green' },
              { index: 'world', health: 'yellow' },
            ],
          },
        },
      });
      const { getByPlaceholderText } = renderWithRouter();
      fireEvent.focus(getByPlaceholderText('sample detector'));
      userEvent.type(
        getByPlaceholderText('sample detector'),
        randomDetector.name
      );
      fireEvent.focus(getByPlaceholderText('Description for detector'));
      userEvent.type(
        getByPlaceholderText('Description for detector'),
        randomDetector.description
      );
    });
  });
});
