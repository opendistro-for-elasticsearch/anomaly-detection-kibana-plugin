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
import { render } from '@testing-library/react';
import { CustomAggregation, validateQuery } from '../CustomAggregation';
import { Provider } from 'react-redux';
import { mockedStore } from '../../../../../redux/utils/testUtils';
import { Formik } from 'formik';
import { FeaturesFormikValues } from '../../../../EditFeatures/containers/utils/formikToFeatures';
import { INITIAL_VALUES } from '../../../../EditFeatures/utils/constants';

const renderWithFormik = (initialValue: FeaturesFormikValues) => ({
  ...render(
    <Provider store={mockedStore()}>
      <Formik initialValues={initialValue} onSubmit={jest.fn()}>
        {formikProps => (
          <div>
            <CustomAggregation index={1}/>
          </div>
        )}
      </Formik>
    </Provider>
  ),
});

describe('<CustomAggregation /> spec', () => {
  test('renders the component', () => {
    const { container } = renderWithFormik(INITIAL_VALUES);
    expect(container.firstChild).toMatchSnapshot();
  });
  describe('validateQuery', () => {
    test('should return undefined if valid query', () => {
      expect(validateQuery('{}')).toBeUndefined();
      expect(validateQuery('{"a":{"b":{}}}')).toBeUndefined();
    });
    test('should return error message if invalid query', () => {
      expect(validateQuery('hello')).toEqual('Invalid JSON');
      expect(validateQuery('{a : b: {}')).toEqual('Invalid JSON');
    });
  });
});
