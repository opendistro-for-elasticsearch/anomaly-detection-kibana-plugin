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
import { render } from '@testing-library/react';
import { Features } from '../Features/Features';
import configureStore from '../../../../../../redux/configureStore';
import {
  httpClientMock,
  coreServicesMock,
} from '../../../../../../../test/mocks';
import { CoreServicesContext } from '../../../../../../components/CoreServices/CoreServices';
import { Formik } from 'formik';
import { FEATURE_TYPE } from '../../../../../../models/interfaces';

const TITLE_TEXT = 'Features';
const DEFAULT_FEATURE_TEXT = 'Add feature';
const TEST_FEATURE_NAME = 'test-feature';
const TEST_FEATURE = {
  featureId: 'test-feature-id',
  featureName: 'test-feature',
  featureType: FEATURE_TYPE.SIMPLE,
  aggregationBy: 'sum',
};

const renderWithRouter = (
  detector: {} = {},
  featureArray: [] = [],
  isLoading: boolean = false
) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <Formik
                  initialValues={{ featureList: featureArray }}
                  onSubmit={jest.fn()}
                >
                  {() => (
                    <div>
                      <Features
                        detector={detector}
                        formikProps={{
                          values: { featureList: featureArray },
                          setFieldValue: jest.fn(),
                          setFieldTouched: jest.fn(),
                        }}
                        isLoading={isLoading}
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

describe('<Features /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component with no given features', () => {
    const { container, getByText } = renderWithRouter({}, [], false);
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
  });
  test('renders the component with one feature', () => {
    console.error = jest.fn();
    const { container, getByText } = renderWithRouter(
      {},
      [TEST_FEATURE],
      false
    );
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
    getByText(TEST_FEATURE_NAME);
    getByText('sum()');
  });
});
