/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import React, { Fragment } from 'react';
import { render } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { CategoryField } from '../CategoryField';

describe('<CategoryField /> spec', () => {
  test('renders the component when disabled', () => {
    const { container, queryByText, queryByTestId } = render(
      <Fragment>
        <Formik
          initialValues={{
            categoryField: [],
          }}
          onSubmit={() => {}}
        >
          <Fragment>
            <Form>
              <CategoryField
                isHCDetector={false}
                categoryFieldOptions={['option 1', 'option 2']}
                setIsHCDetector={(isHCDetector: boolean) => {
                  return;
                }}
                isLoading={false}
                originalShingleSize={1}
              />
            </Form>
          </Fragment>
        </Formik>
      </Fragment>
    );
    expect(container).toMatchSnapshot();
    expect(queryByTestId('noCategoryFieldsCallout')).toBeNull();
    expect(queryByTestId('categoryFieldComboBox')).toBeNull();
    expect(queryByText('Enable category field')).not.toBeNull();
  });
  test('renders the component when enabled', () => {
    const { container, queryByText, queryByTestId } = render(
      <Fragment>
        <Formik
          initialValues={{
            categoryField: [],
          }}
          onSubmit={() => {}}
        >
          <Fragment>
            <Form>
              <CategoryField
                isHCDetector={true}
                categoryFieldOptions={['option 1', 'option 2']}
                setIsHCDetector={(isHCDetector: boolean) => {
                  return;
                }}
                isLoading={false}
                originalShingleSize={1}
              />
            </Form>
          </Fragment>
        </Formik>
      </Fragment>
    );
    expect(container).toMatchSnapshot();
    expect(queryByTestId('noCategoryFieldsCallout')).toBeNull();
    expect(queryByTestId('categoryFieldComboBox')).not.toBeNull();
    expect(queryByText('Enable category field')).not.toBeNull();
  });
  test('shows callout when there are no available category fields', () => {
    const { container, queryByText, queryByTestId } = render(
      <Fragment>
        <Formik
          initialValues={{
            categoryField: [],
          }}
          onSubmit={() => {}}
        >
          <Fragment>
            <Form>
              <CategoryField
                isHCDetector={true}
                categoryFieldOptions={[]}
                setIsHCDetector={(isHCDetector: boolean) => {
                  return;
                }}
                isLoading={false}
                originalShingleSize={1}
              />
            </Form>
          </Fragment>
        </Formik>
      </Fragment>
    );
    expect(container).toMatchSnapshot();
    expect(queryByTestId('noCategoryFieldsCallout')).not.toBeNull();
    expect(queryByTestId('categoryFieldComboBox')).toBeNull();
    expect(queryByText('Enable category field')).not.toBeNull();
  });
  test('hides callout if component is loading', () => {
    const { container, queryByText, queryByTestId } = render(
      <Fragment>
        <Formik
          initialValues={{
            categoryField: [],
          }}
          onSubmit={() => {}}
        >
          <Fragment>
            <Form>
              <CategoryField
                isHCDetector={true}
                categoryFieldOptions={[]}
                setIsHCDetector={(isHCDetector: boolean) => {
                  return;
                }}
                isLoading={true}
                originalShingleSize={1}
              />
            </Form>
          </Fragment>
        </Formik>
      </Fragment>
    );
    expect(container).toMatchSnapshot();
    expect(queryByTestId('noCategoryFieldsCallout')).toBeNull();
    expect(queryByText('Enable category field')).not.toBeNull();
  });
});
