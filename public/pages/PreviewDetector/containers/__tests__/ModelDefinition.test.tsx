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
import {
  render,
  fireEvent,
  wait,
  waitForElement,
} from '@testing-library/react';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { ModelDefinition } from '../ModelDefinition';
import { Detector, UiMetaData, UNITS } from '../../../../models/interfaces';
import {
  getRandomDetector,
  getRandomFeature,
} from '../../../../redux/reducers/__tests__/utils';
import configureStore from '../../../../redux/configureStore';
import { httpClientMock } from '../../../../../test/mocks';
import userEvent from '@testing-library/user-event';

const renderWithRouter = (detector: Detector) => ({
  ...render(
    <Provider store={configureStore(httpClientMock)}>
      <Router>
        <Switch>
          <Route
            render={(props: RouteComponentProps) => (
              <ModelDefinition
                detector={detector}
                detectorId={detector.id}
                {...props}
              />
            )}
          />
        </Switch>
      </Router>
    </Provider>
  ),
});

//FIXME: Somehow Jest mock is not able pick the correct mock.
// jest.mock('ui/new_platform');
jest.mock('ui/notify', () => {
  return {
    toastNotifications: {
      addDanger: jest.fn().mockName('addDanger'),
      addSuccess: jest.fn().mockName('addSuccess'),
    },
    getUiSettingsClient: () => {
      return {
        get: jest.fn(),
      };
    },
    breadcrumbs: {
      set: jest.fn(),
    },
    getNewPlatform: () => {
      start: {
        core: {
          chrome: {
            navLinks: {
              has: jest
                .fn()
                .mockReturnValue('http://localhost:5601/app/opendistro-ad');
              get: jest.fn().mockReturnValue({
                url: 'http://localhost:5601/app/opendistro-ad',
              });
            }
          }
        }
      }
    },
  };
});
describe('<ModelDefinition /> spec', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  httpClientMock.post = jest.fn().mockResolvedValue({
    data: { ok: true, response: { anomalies: [], featureData: [] } },
  });

  test('renders the component', () => {
    const randomDetector = {
      ...getRandomDetector(false),
    };
    const { container } = renderWithRouter(randomDetector);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders empty state of features', async () => {
    const randomDetector = {
      ...getRandomDetector(false),
      uiMetadata: {} as UiMetaData,
      featureAttributes: [],
    };
    const { getByText } = renderWithRouter(randomDetector);
    await wait(() => {
      getByText(
        'No features have been added to this anomaly detector. A feature is a metric that used for anomaly detection. A detector can discover anomalies across one or many features. This system reports an anomaly score based on how strong a signal might be.'
      );
    });
  });
  describe('Detector features', () => {
    describe('features flyout interactions', () => {
      test('should able to open add new feature flyout', async () => {
        const randomDetector = getRandomDetector(false);
        const { getByTestId, getByText } = renderWithRouter(randomDetector);
        fireEvent.click(getByTestId('createButton'));
        await wait(() => {
          getByText('New feature');
          getByText('Save');
        });
      });
    });
    describe('Add new feature', () => {
      test('should able to create new feature with custom aggregation', async () => {
        const randomDetector = getRandomDetector(false);
        const randomFeature = getRandomFeature(false);
        httpClientMock.put = jest.fn().mockResolvedValue({
          data: {
            ok: true,
            response: {
              ...randomDetector,
              featureAttributes: [
                ...randomDetector.featureAttributes,
                randomFeature,
              ],
            },
          },
        });
        const { getByTestId, getByPlaceholderText } = renderWithRouter(
          randomDetector
        );
        fireEvent.click(getByTestId('createButton'));
        await wait();
        userEvent.type(
          getByPlaceholderText('Name of feature'),
          randomFeature.featureName
        );
        fireEvent.change(getByTestId('featureType'), {
          target: { value: 'custom_aggs' },
        });
        // const editor = container.querySelector('textarea');
        // if (editor != null) {
        //   fireEvent.input(editor, { target: { value: JSON.stringify(randomFeature.aggregationQuery, null, 4)}});
        //   await wait();
        // }
        fireEvent.click(getByTestId('updateDetectorFeature'));
        await wait();
        expect(httpClientMock.put).toHaveBeenCalledTimes(1);
        // expect(httpClientMock.put).toHaveBeenCalledWith(
        //   `..${AD_NODE_API.DETECTOR}/${randomDetector.id}`,
        //   {
        //     ...randomDetector,
        //     featureAttributes: [randomDetector.featureAttributes, randomFeature],
        //     uiMetadata: {
        //       ...randomDetector.uiMetadata,
        //       features: {
        //         ...randomDetector.uiMetadata.features,
        //         [randomFeature.featureName]: {
        //           featureType: 'custom_aggs',
        //         },
        //       },
        //     },
        //   },
        //   {
        //     params: {
        //       ifPrimaryTerm: randomDetector.primaryTerm,
        //       ifSeqNo: randomDetector.seqNo,
        //     },
        //   }
        // );
        expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
        expect(toastNotifications.addSuccess).toHaveBeenCalledWith(
          `Feature created: ${randomFeature.featureName}`
        );
        expect(toastNotifications.addDanger).toHaveBeenCalledTimes(0);
      });
    });
    describe('Edit feature', () => {
      test('should not throw an error if feature name is duplicate and is editing same feature', async () => {
        const randomDetector = getRandomDetector(false);
        const {
          queryByText,
          getAllByTestId,
          getByPlaceholderText,
        } = renderWithRouter(randomDetector);
        const editElements = getAllByTestId('editFeature');
        fireEvent.click(editElements[0]);
        await wait();
        userEvent.type(
          getByPlaceholderText('Name of feature'),
          randomDetector.featureAttributes[0].featureName
        );
        fireEvent.blur(getByPlaceholderText('Name of feature'));
        expect(queryByText('Duplicate feature name')).toBeNull();
      });
      test('should able to open edit existing feature flyout', async () => {
        const randomDetector = getRandomDetector(false);
        const { getByText, getAllByTestId, getByTitle } = renderWithRouter(
          randomDetector
        );
        const editElements = getAllByTestId('editFeature');
        fireEvent.click(editElements[0]);
        await wait(() => {
          getByTitle(
            randomDetector.featureAttributes[0].featureName.toString()
          );
          getByText('Update');
          getByText('Delete');
        });
      });
    });
    describe('Delete feature', () => {
      test('should able to display delete confirmation Modal', async () => {
        const randomDetector = getRandomDetector(false);
        const { getByText, getAllByTestId } = renderWithRouter(randomDetector);
        const editElements = getAllByTestId('editFeature');
        fireEvent.click(editElements[0]);
        await wait();
        fireEvent.click(getByText('Delete'));
        getByText('Delete this feature?');
      });
      test('should close modal if user cancel to delete', async () => {
        const randomDetector = getRandomDetector(false);
        const {
          getByText,
          getAllByTestId,
          getByTestId,
          queryByText,
        } = renderWithRouter(randomDetector);
        const editElements = getAllByTestId('editFeature');
        fireEvent.click(editElements[0]);
        await wait();
        fireEvent.click(getByText('Delete'));
        fireEvent.click(getByTestId('confirmModalCancelButton'));
        await wait();
        expect(queryByText('Delete this detector?')).toBeNull();
      });
      test('should show success message on successful feature delete', async () => {
        httpClientMock.delete = jest
          .fn()
          .mockResolvedValue({ data: { ok: true, response: {} } });
        const randomDetector = getRandomDetector(false);
        const { getByText, getAllByTestId, getByTestId } = renderWithRouter(
          randomDetector
        );
        const editElements = getAllByTestId('editFeature');
        fireEvent.click(editElements[0]);
        await wait();
        fireEvent.click(getByText('Delete'));
        fireEvent.click(getByTestId('confirmModalConfirmButton'));
        await wait();
        expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
        expect(toastNotifications.addSuccess).toHaveBeenCalledWith(
          'Feature has been deleted successfully'
        );
      });
    });
    describe('feature validations', () => {
      test('should validate if onChange / blur', async () => {
        const randomDetector = getRandomDetector(false);
        const {
          getByTestId,
          getByText,
          getByPlaceholderText,
        } = renderWithRouter(randomDetector);
        fireEvent.click(getByTestId('createButton'));
        await wait();
        fireEvent.focus(getByPlaceholderText('Name of feature'));
        fireEvent.blur(getByPlaceholderText('Name of feature'));
        await wait(() => {
          getByText('Required');
        });
      });
      test('should throw an error if feature name is duplicate', async () => {
        const randomDetector = getRandomDetector(false);
        const {
          getByTestId,
          getByText,
          getByPlaceholderText,
        } = renderWithRouter(randomDetector);
        fireEvent.click(getByTestId('createButton'));
        await wait();
        fireEvent.focus(getByPlaceholderText('Name of feature'));
        userEvent.type(
          getByPlaceholderText('Name of feature'),
          randomDetector.featureAttributes[0].featureName
        );
        fireEvent.blur(getByPlaceholderText('Name of feature'));
        await wait(() => {
          getByText('Duplicate feature name');
        });
      });

      test('should throw an error if name is more than 256 characters', async () => {
        const randomDetector = getRandomDetector(false);
        const {
          getByTestId,
          getByText,
          getByPlaceholderText,
        } = renderWithRouter(randomDetector);
        fireEvent.click(getByTestId('createButton'));
        await wait();
        fireEvent.focus(getByPlaceholderText('Name of feature'));
        userEvent.type(
          getByPlaceholderText('Name of feature'),
          new Array(257)
            .fill('n')
            .join('')
            .toString()
        );
        fireEvent.blur(getByPlaceholderText('Name of feature'));
        waitForElement(() => getByText('Name is too big maximum limit is 256'));
      });
    });
  });
  describe('Adjust model', () => {
    test('should able to open add adjust model flyout', async () => {
      const randomDetector = getRandomDetector(false);
      const { getByTestId, getByText, getAllByText } = renderWithRouter(
        randomDetector
      );
      fireEvent.click(getByTestId('adjustModel'));
      await wait();
      expect(getAllByText('Adjust model').length).toBe(2);
      getByText('Save');
    });
    test('should able to update the interval', async () => {
      const randomDetector = getRandomDetector(false);
      httpClientMock.put = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            ...randomDetector,
            detectionInterval: {
              period: {
                interval: 20,
                unit: UNITS.MINUTES,
              },
            },
            windowDelay: {
              period: {
                interval: 1,
                unit: UNITS.MINUTES,
              },
            },
          },
        },
      });
      const { getByTestId } = renderWithRouter(randomDetector);
      fireEvent.click(getByTestId('adjustModel'));
      await wait();
      userEvent.type(getByTestId('detectionInterval'), '20');
      userEvent.type(getByTestId('windowDelay'), '2');
      fireEvent.click(getByTestId('updateAdjustModel'));
      await wait();
      expect(httpClientMock.put).toHaveBeenCalledTimes(1);
      expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
      expect(toastNotifications.addSuccess).toHaveBeenCalledWith(
        'Detector has been adjusted successfully'
      );
    });
  });
  describe('Delete detector', () => {
    test('should able to display delete confirmation Modal', async () => {
      const randomDetector = getRandomDetector(false);
      const { getByText, getByTestId } = renderWithRouter(randomDetector);
      const actions = getByText('Actions');
      fireEvent.click(actions);
      const deleteDetectorElement = await waitForElement(() =>
        getByTestId('deleteDetector')
      );
      fireEvent.click(deleteDetectorElement);
      getByText('Delete this detector?');
    });
    test('should close modal if user cancel to delete', async () => {
      const randomDetector = getRandomDetector(false);
      const { getByText, getByTestId, queryByText } = renderWithRouter(
        randomDetector
      );
      const actions = getByText('Actions');
      fireEvent.click(actions);
      const deleteDetectorElement = await waitForElement(() =>
        getByTestId('deleteDetector')
      );
      fireEvent.click(deleteDetectorElement);
      fireEvent.click(getByTestId('confirmModalCancelButton'));
      await wait();
      expect(queryByText('Delete this detector?')).toBeNull();
    });

    test('should show success message on successful delete', async () => {
      httpClientMock.delete = jest
        .fn()
        .mockResolvedValue({ data: { ok: true, response: {} } });
      const randomDetector = getRandomDetector(false);
      const { getByText, getByTestId } = renderWithRouter(randomDetector);
      const actions = getByText('Actions');
      fireEvent.click(actions);
      const deleteDetectorElement = await waitForElement(() =>
        getByTestId('deleteDetector')
      );
      fireEvent.click(deleteDetectorElement);
      fireEvent.click(getByTestId('confirmModalConfirmButton'));
      await wait();
      expect(toastNotifications.addSuccess).toHaveBeenCalledTimes(1);
      expect(toastNotifications.addSuccess).toHaveBeenCalledWith(
        'Detector has been deleted successfully'
      );
    });

    test('should show error message if delete fails', async () => {
      httpClientMock.delete = jest.fn().mockRejectedValue({
        data: { ok: false, error: 'Detector is being consumed by Monitor' },
      });
      const randomDetector = getRandomDetector(false);
      const { getByText, getByTestId } = renderWithRouter(randomDetector);
      const actions = getByText('Actions');
      fireEvent.click(actions);
      const deleteDetectorElement = await waitForElement(() =>
        getByTestId('deleteDetector')
      );
      fireEvent.click(deleteDetectorElement);
      fireEvent.click(getByTestId('confirmModalConfirmButton'));
      await wait();
      expect(toastNotifications.addDanger).toHaveBeenCalledTimes(1);
      expect(toastNotifications.addDanger).toHaveBeenCalledWith(
        'There was a problem deleting detector'
      );
    });
  });
});
