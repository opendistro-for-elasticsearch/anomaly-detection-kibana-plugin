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
import {
  render,
  fireEvent,
  wait,
  waitForElement,
} from '@testing-library/react';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
import { DetectorConfig } from '../DetectorConfig';
import {
  Detector,
  UiMetaData,
  FILTER_TYPES,
  UIFilter,
  FEATURE_TYPE,
  UiFeature,
  FeatureAttributes,
} from '../../../../models/interfaces';
import {
  getRandomDetector,
  getRandomFeature,
} from '../../../../redux/reducers/__tests__/utils';
import configureStore from '../../../../redux/configureStore';
import { httpClientMock } from '../../../../../test/mocks';
import userEvent from '@testing-library/user-event';
import { toString } from '../MetaData';
import { DATA_TYPES } from '../../../../utils/constants';
import { OPERATORS_MAP } from '../../../createDetector/components/DataFilters/utils/constant';
import { displayText } from '../../../createDetector/components/DataFilters/utils/helpers';

const renderWithRouter = (detector: Detector) => ({
  ...render(
    <Router>
      <Switch>
        <Route
          render={(props: RouteComponentProps) => (
            <DetectorConfig
              detector={detector}
              detectorId={detector.id}
              {...props}
            />
          )}
        />
      </Switch>
    </Router>
  ),
});

const fieldInFilter = 'age';
const filters = [
  {
    fieldInfo: [{ label: fieldInFilter, type: DATA_TYPES.NUMBER }],
    operator: OPERATORS_MAP.IN_RANGE,
    fieldRangeStart: 20,
    fieldRangeEnd: 40,
  },
  {
    fieldInfo: [{ label: fieldInFilter, type: DATA_TYPES.NUMBER }],
    operator: OPERATORS_MAP.IS_NOT_NULL,
  },
] as UIFilter[];

const featureQuery1 = {
  featureName: 'value',
  featureEnabled: true,
  aggregationQuery: {
    size: 0,
    query: {
      bool: {
        must: {
          terms: {
            detector_id: ['detector_1', 'detector_2'],
          },
        },
      },
    },
    aggs: {
      unique_detectors: {
        terms: {
          field: 'detector_id',
          size: 20,
          order: {
            total_anomalies_in_24hr: 'asc',
          },
        },
        aggs: {
          total_anomalies_in_24hr: {
            filter: {
              range: {
                data_start_time: { gte: 'now-24h', lte: 'now' },
              },
            },
          },
          latest_anomaly_time: { max: { field: 'data_start_time' } },
        },
      },
    },
  },
} as { [key: string]: any };

const featureQuery2 = {
  featureName: 'value2',
  featureEnabled: true,
  aggregationQuery: {
    aggregation_name: {
      max: {
        field: 'value2',
      },
    },
  },
} as { [key: string]: any };

describe('<DetectorConfig /> spec', () => {
  test('renders the component', () => {
    const randomDetector = {
      ...getRandomDetector(false),
    };
    const { container } = renderWithRouter(randomDetector);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders empty features and filters', async () => {
    const randomDetector = {
      ...getRandomDetector(true),
      uiMetadata: {} as UiMetaData,
      featureAttributes: [],
    };
    const { getByText } = renderWithRouter(randomDetector);
    await wait(() => {
      getByText('Features are required to run a detector');
      getByText(
        'Specify index fields that you want to find anomalies for by defining features. Once you define the features, you can preview your anomalies from a sample feature output.'
      );
      getByText('Features (0)');
      getByText(randomDetector.name);
      getByText(randomDetector.indices[0]);
      getByText(toString(randomDetector.detectionInterval));
      getByText(toString(randomDetector.lastUpdateTime));
      getByText(randomDetector.id);
      getByText(toString(randomDetector.windowDelay));
      getByText(randomDetector.description);
      // filter should be -
      getByText('-');
      getByText(
        'Specify index fields that you want to find anomalies for by defining features. A detector can discover anomalies across up to 5 features. Once you define the features, you can preview your anomalies from a sample feature output.'
      );
    });
  });

  test('renders empty features and one simple filter', async () => {
    const randomDetector = {
      ...getRandomDetector(true),
      uiMetadata: {
        filterType: FILTER_TYPES.SIMPLE,
        filters: [filters[0]],
      } as UiMetaData,
      featureAttributes: [],
    };
    const { getByText } = renderWithRouter(randomDetector);
    await wait(() => {
      getByText(displayText(filters[0]));
    });
  });

  test('renders empty features and two simple filters', async () => {
    const randomDetector = {
      ...getRandomDetector(true),
      uiMetadata: {
        filterType: FILTER_TYPES.SIMPLE,
        filters: filters,
      } as UiMetaData,
      featureAttributes: [],
    };
    const { getByText } = renderWithRouter(randomDetector);
    await wait(() => {
      // filter should be -
      getByText(displayText(filters[0]));
      getByText(displayText(filters[1]));
    });
  });

  test('renders empty features and a custom filter', async () => {
    const randomDetector = {
      ...getRandomDetector(true),
      uiMetadata: {
        filterType: FILTER_TYPES.CUSTOM,
        filters: [filters[0]],
      } as UiMetaData,
      featureAttributes: [],
    };
    const { getByTestId, getByText, queryByText } = renderWithRouter(
      randomDetector
    );
    await wait(() => {
      // filter should be -
      getByText('Custom expression:');
      expect(queryByText(fieldInFilter)).toBeNull();
      expect(queryByText('filter')).toBeNull();
    });

    fireEvent.click(getByTestId('viewFilter'));
    await wait(() => {
      queryByText(fieldInFilter);
      queryByText('filter');
    });
  });

  describe('test 1 simple feature enabled/disabled', () => {
    test.each([[true, 'Enabled'], [false, 'Disabled']])(
      'renders 1 simple feature enabled/disabled',
      async (enabledInDef, enabledInRender) => {
        const randomDetector = {
          ...getRandomDetector(true),
          featureAttributes: [
            {
              featureName: 'value',
              featureEnabled: enabledInDef,
            },
          ] as FeatureAttributes[],
          uiMetadata: {
            filterType: FILTER_TYPES.SIMPLE,
            filters: [],
            features: {
              value: {
                featureType: FEATURE_TYPE.SIMPLE,
                aggregationOf: 'value',
                aggregationBy: 'avg',
              } as UiFeature,
            },
          } as UiMetaData,
        };
        const { getByText } = renderWithRouter(randomDetector);
        await wait(() => {
          getByText('Field: value');
          getByText('Aggregation method: avg');
          getByText(enabledInRender);
        });
      }
    );
  });

  test('renders one custom feature', async () => {
    const randomDetector = {
      ...getRandomDetector(true),
      featureAttributes: [
        {
          featureName: 'value',
          featureEnabled: true,
          aggregationQuery: featureQuery1,
        },
      ] as FeatureAttributes[],
      uiMetadata: {
        filterType: FILTER_TYPES.SIMPLE,
        filters: [],
        features: {
          value: {
            featureType: FEATURE_TYPE.CUSTOM,
          } as UiFeature,
        },
      } as UiMetaData,
    };
    const { getByTestId, getByText, queryByText } = renderWithRouter(
      randomDetector
    );
    await wait(() => {
      getByText('Custom expression:');
      expect(queryByText('detector_1')).toBeNull();
      expect(queryByText('detector_2')).toBeNull();
    });

    fireEvent.click(getByTestId('viewFeature-0'));
    await wait(() => {
      queryByText('detector_1');
      queryByText('detector_2');
    });
  });

  describe('renders two custom features', () => {
    test.each([
      [
        'viewFeature-0',
        ['detector_1', 'detector_2'],
        ['max', 'aggregation_name'],
      ],
      [
        'viewFeature-1',
        ['max', 'aggregation_name'],
        ['detector_1', 'detector_2'],
      ],
    ])(
      'renders two custom features',
      async (toClick, notExpected, expected) => {
        const randomDetector = {
          ...getRandomDetector(true),
          featureAttributes: [
            {
              featureName: 'value',
              featureEnabled: true,
              aggregationQuery: featureQuery1,
            },
            {
              featureName: 'value2',
              featureEnabled: true,
              aggregationQuery: featureQuery2,
            },
          ] as FeatureAttributes[],
          uiMetadata: {
            filterType: FILTER_TYPES.SIMPLE,
            filters: [],
            features: {
              value: {
                featureType: FEATURE_TYPE.CUSTOM,
              } as UiFeature,
              value2: {
                featureType: FEATURE_TYPE.CUSTOM,
              } as UiFeature,
            },
          } as UiMetaData,
        };
        const { getByTestId, getAllByText, queryByText } = renderWithRouter(
          randomDetector
        );
        await wait(() => {
          getAllByText('Custom expression:');
          expect(queryByText('detector_1')).toBeNull();
          expect(queryByText('detector_2')).toBeNull();
          expect(queryByText('max')).toBeNull();
          expect(queryByText('aggregation_name')).toBeNull();
        });

        fireEvent.click(getByTestId(toClick));
        await wait(() => {
          notExpected.forEach((obj, index) => {
            expect(queryByText(notExpected[index])).toBeNull();
          });
          expected.forEach((obj, index) => {
            queryByText(expected[index]);
          });
        });
      }
    );
  });

  test('renders the component with 2 custom and 1 simple features', () => {
    const randomDetector = {
      ...getRandomDetector(true),
      featureAttributes: [
        {
          featureName: 'value',
          featureEnabled: true,
          aggregationQuery: featureQuery1,
        },
        {
          featureName: 'value2',
          featureEnabled: true,
          aggregationQuery: featureQuery2,
        },
        {
          featureName: 'value',
          featureEnabled: false,
        },
      ] as FeatureAttributes[],
      uiMetadata: {
        filterType: FILTER_TYPES.SIMPLE,
        filters: [],
        features: {
          value: {
            featureType: FEATURE_TYPE.CUSTOM,
          } as UiFeature,
          value2: {
            featureType: FEATURE_TYPE.CUSTOM,
          } as UiFeature,
          value3: {
            featureType: FEATURE_TYPE.SIMPLE,
            aggregationOf: 'value3',
            aggregationBy: 'avg',
          } as UiFeature,
        },
      } as UiMetaData,
    };
    const { container } = renderWithRouter(randomDetector);
    expect(container.firstChild).toMatchSnapshot();
  });
});
