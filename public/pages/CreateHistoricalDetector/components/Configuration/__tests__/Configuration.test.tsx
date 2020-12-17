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
import { Configuration } from '../Configuration';
import configureStore from '../../../../../redux/configureStore';
import { httpClientMock, coreServicesMock } from '../../../../../../test/mocks';
import { CoreServicesContext } from '../../../../../components/CoreServices/CoreServices';
import { Formik } from 'formik';
import { SAVE_HISTORICAL_DETECTOR_OPTIONS } from '../../../utils/constants';

const TITLE_TEXT = 'Detector settings';
const EXISTING_DETECTOR_TEXT = 'Configure using an existing detector';

const renderWithRouter = (isEdit: boolean = false) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => (
              <CoreServicesContext.Provider value={coreServicesMock}>
                <Formik
                  initialValues={{ featureList: [] }}
                  onSubmit={jest.fn()}
                >
                  {() => (
                    <div>
                      <Configuration
                        formikProps={{
                          values: { featureList: [] },
                          setFieldValue: jest.fn(),
                          setFieldTouched: jest.fn(),
                        }}
                        isEdit={isEdit}
                        detector={{}}
                        isLoading={false}
                        selectedSaveOption={
                          SAVE_HISTORICAL_DETECTOR_OPTIONS.START
                        }
                        onSaveOptionChange={jest.fn()}
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

describe('<Configuration /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders the component in create mode with existing detectors option', () => {
    console.error = jest.fn();
    const { container, getByText, queryByText } = renderWithRouter(true);
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
    expect(queryByText(EXISTING_DETECTOR_TEXT)).toBeNull();
  });

  test('renders the component in edit mode without existing detectors option', () => {
    console.error = jest.fn();
    const { container, getByText, findByText } = renderWithRouter(true);
    expect(container.firstChild).toMatchSnapshot();
    getByText(TITLE_TEXT);
    expect(findByText(EXISTING_DETECTOR_TEXT)).not.toBeNull();
  });
});
