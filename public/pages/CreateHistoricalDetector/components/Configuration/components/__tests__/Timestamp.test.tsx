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
import { Timestamp } from '../Timestamp/Timestamp';
import configureStore from '../../../../../../redux/configureStore';
import {
  httpClientMock,
  coreServicesMock,
} from '../../../../../../../test/mocks';
import { CoreServicesContext } from '../../../../../../components/CoreServices/CoreServices';
import { Formik } from 'formik';
import userEvent from '@testing-library/user-event';

const TITLE_TEXT = 'Timestamp';
const CALLOUT_TEXT =
  'A remote index is selected, so you need to manually input the time field.';
const INVALID_TEXT = 'Required';

const REGULAR_INDEX = [{ label: 'regular-index' }];
const REMOTE_INDEX = [{ label: 'remote:index' }];

const renderWithRouter = (indexArray: [] = []) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <Formik
                  initialValues={{ index: indexArray }}
                  onSubmit={jest.fn()}
                >
                  {() => (
                    <div>
                      <Timestamp
                        formikProps={{
                          values: { index: indexArray },
                          setFieldValue: jest.fn(),
                          setFieldTouched: jest.fn(),
                        }}
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

describe('<Timestamp /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component with regular index', () => {
    const { container, getByText, queryByText } = renderWithRouter(
      REGULAR_INDEX
    );
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
    expect(queryByText(CALLOUT_TEXT)).toBeNull();
  });
  test('renders the component with remote index', () => {
    const { container, getByText } = renderWithRouter(REMOTE_INDEX);
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
    getByText(CALLOUT_TEXT);
  });
  test('catches invalid empty timestamp', async () => {
    const { getByText } = renderWithRouter();
    userEvent.click(getByText('Find timestamp'));
    fireEvent.blur(getByText('Find timestamp'));
    await wait();
    getByText(TITLE_TEXT);
    getByText(INVALID_TEXT);
  });
});
