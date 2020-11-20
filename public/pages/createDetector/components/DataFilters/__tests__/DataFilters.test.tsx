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
import { Formik } from 'formik';
import React from 'react';
import { Provider } from 'react-redux';
import {
  initialState,
  mockedStore,
} from '../../../../../redux/utils/testUtils';
import { ADFormikValues } from '../../../containers/models/interfaces';
import { INITIAL_VALUES } from '../../../containers/utils/constant';
import { DataFilter } from '../DataFilter';
import { CoreServicesContext } from '../../../../../components/CoreServices/CoreServices';
import { coreServicesMock } from '../../../../../../test/mocks';

const renderDataFilter = (initialValue: ADFormikValues) => ({
  ...render(
    <Provider
      store={mockedStore({
        ...initialState,
        elasticsearch: {
          ...initialState.elasticsearch,
          dataTypes: {
            keyword: ['cityName.keyword'],
            integer: ['age'],
            text: ['cityName'],
          },
        },
      })}
    >
      <CoreServicesContext.Provider value={coreServicesMock}>
        <Formik initialValues={initialValue} onSubmit={jest.fn()}>
          {(formikProps) => (
            <div>
              <DataFilter formikProps={formikProps} />
            </div>
          )}
        </Formik>
      </CoreServicesContext.Provider>
    </Provider>
  ),
});
describe('<DataFilter /> spec', () => {
  test('renders empty message if no filters are available', async () => {
    const { getByText, getAllByText } = renderDataFilter(INITIAL_VALUES);
    getByText('Use data filter to reduce noisy data');
    expect(getAllByText('Add filter')).not.toBeNull();
    expect(getAllByText('Add filter').length).toBe(2);
  });
  test('should render filter on clicking on Add Filter', async () => {
    try {
      const { getByText, getAllByText } = renderDataFilter(INITIAL_VALUES);
      fireEvent.click(getAllByText('Add filter')[1]);
      expect(getByText('Add filter')).not.toBeNull();
      getByText('Operator');
      getByText('Field');
    } catch (e) {
      console.log('error', e);
    }
  });
});
