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
import { Provider } from 'react-redux';
import {
  HashRouter as Router,
  RouteComponentProps,
  Route,
  Switch,
} from 'react-router-dom';
import { render, fireEvent, wait } from '@testing-library/react';
import { IndexChooser } from '../IndexChooser';
import configureStore from '../../../../../redux/configureStore';
import { httpClientMock, coreServicesMock } from '../../../../../../test/mocks';
import { CoreServicesContext } from '../../../../../components/CoreServices/CoreServices';
import { Formik } from 'formik';

const CALLOUT_TEXT =
  'Modifying the selected index resets your detector configuration.';
const HELP_TEXT = 'Choose an index or index pattern as the data source.';
const INVALID_TEXT = 'Must specify an index';
const PLACEHOLDER_TEXT = 'Find indices';

const renderWithRouter = (isEdit: boolean = false) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <Formik initialValues={{}} onSubmit={jest.fn()}>
                  {() => (
                    <div>
                      <IndexChooser
                        formikProps={{ values: {} }}
                        isEdit={isEdit}
                        {...props}
                      />
                    </div>
                  )}
                </Formik>
              </CoreServicesContext.Provider>
            )}
          />
        </Switch>
      </Router>
    </Provider>
  ),
});

describe('<IndexChooser /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component in create mode', () => {
    httpClientMock.get = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        indices: [
          { index: 'hello', health: 'green' },
          { index: 'world', health: 'yellow' },
        ],
      },
    });
    const { container, getByText, queryByText } = renderWithRouter(false);
    expect(container.firstChild).toMatchSnapshot();
    getByText(HELP_TEXT);
    expect(queryByText(CALLOUT_TEXT)).toBeNull();
  });

  test('renders the component in edit mode with callout', () => {
    httpClientMock.get = jest.fn().mockResolvedValue({
      ok: true,
      response: {
        indices: [
          { index: 'hello', health: 'green' },
          { index: 'world', health: 'yellow' },
        ],
      },
    });
    const { container, getByText, findByText } = renderWithRouter(true);
    expect(container.firstChild).toMatchSnapshot();
    getByText(HELP_TEXT);
    expect(findByText(CALLOUT_TEXT)).not.toBeNull();
  });
  test('shows error for invalid index selection', async () => {
    console.warn = jest.fn();
    const { queryByText, findByText, getByText } = renderWithRouter(false);
    expect(queryByText(INVALID_TEXT)).toBeNull();
    fireEvent.focus(getByText(PLACEHOLDER_TEXT));
    await wait();
    fireEvent.blur(getByText(PLACEHOLDER_TEXT));
    await wait();
    expect(findByText(INVALID_TEXT)).not.toBeNull();
  });
});
