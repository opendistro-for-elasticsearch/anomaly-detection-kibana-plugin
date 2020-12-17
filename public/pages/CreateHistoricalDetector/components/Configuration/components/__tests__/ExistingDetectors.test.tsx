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
import { render, fireEvent } from '@testing-library/react';
import { ExistingDetectors } from '../ExistingDetectors/ExistingDetectors';
import configureStore from '../../../../../../redux/configureStore';
import {
  httpClientMock,
  coreServicesMock,
} from '../../../../../../../test/mocks';
import { CoreServicesContext } from '../../../../../../components/CoreServices/CoreServices';
import { Formik } from 'formik';

const TITLE_TEXT = 'Configure using an existing detector';
const HELP_TEXT =
  'Choose if you would like to source an existing real-time or historical detector to use as a template for your configuration.';
const NO_INDEX_CALLOUT_TEXT =
  'No index has been selected. Please select an index first.';
const NO_DETECTORS_CALLOUT_TEXT =
  'No existing detectors are using the selected index.';

const renderWithRouter = (isEdit: boolean = false, formikValues: {} = {}) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <Formik
                  initialValues={{ index: [{ label: 'test-index' }] }}
                  onSubmit={jest.fn()}
                >
                  {() => (
                    <div>
                      <ExistingDetectors
                        formikProps={{
                          values: formikValues,
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

describe('<ExistingDetectors /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component', () => {
    const { container, getByText } = renderWithRouter(false);
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
    getByText(HELP_TEXT);
    getByText('No');
    getByText('Yes');
  });
  test('renders no index callout if applicable', () => {
    const { getByText, queryByText } = renderWithRouter(false, {});
    getByText(TITLE_TEXT);
    getByText(HELP_TEXT);
    expect(queryByText(NO_INDEX_CALLOUT_TEXT)).toBeNull();
    fireEvent.click(getByText('Yes'));
    getByText(NO_INDEX_CALLOUT_TEXT);
  });
  test('renders no eligible detectors callout if applicable', () => {
    const propsWithIndex = { index: [{ label: 'test-index' }] };
    const { getByText, queryByText } = renderWithRouter(false, propsWithIndex);
    getByText(TITLE_TEXT);
    getByText(HELP_TEXT);
    expect(queryByText(NO_DETECTORS_CALLOUT_TEXT)).toBeNull();
    fireEvent.click(getByText('Yes'));
    getByText(NO_DETECTORS_CALLOUT_TEXT);
  });
});
