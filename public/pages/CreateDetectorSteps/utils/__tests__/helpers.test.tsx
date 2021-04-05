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

import { INITIAL_DETECTOR_DEFINITION_VALUES } from '../../../DefineDetector/utils/constants';
import {
  MULTI_ENTITY_SHINGLE_SIZE,
  SINGLE_ENTITY_SHINGLE_SIZE,
} from '../../../../utils/constants';
import { getRandomDetector } from '../../../../redux/reducers/__tests__/utils';
import { detectorDefinitionToFormik } from '../../../DefineDetector/utils/helpers';
import {
  formikToDetector,
  formikToFilterQuery,
} from '../../../ReviewAndCreate/utils/helpers';
import { prepareDetector } from '../../../ConfigureModel/utils/helpers';
import {
  Detector,
  FEATURE_TYPE,
  FILTER_TYPES,
  OPERATORS_MAP,
  UIFilter,
  UNITS,
} from '../../../../models/interfaces';
import { FeaturesFormikValues } from '../../../ConfigureModel/models/interfaces';
import { DATA_TYPES } from '../../../../utils/constants';

describe('adToFormik', () => {
  test('should return initialValues if detector is null', () => {
    const randomDetector = {} as Detector;
    const adFormikValues = detectorDefinitionToFormik(randomDetector);
    expect(adFormikValues).toEqual(INITIAL_DETECTOR_DEFINITION_VALUES);
  });
  test('should return remote values if detector is not null', () => {
    const randomDetector = getRandomDetector();
    const adFormikValues = detectorDefinitionToFormik(randomDetector);
    expect(adFormikValues).toEqual({
      detectorName: randomDetector.name,
      detectorDescription: randomDetector.description,
      filters: randomDetector.uiMetadata.filters,
      filterType: FILTER_TYPES.SIMPLE,
      filterQuery: JSON.stringify(randomDetector.filterQuery || {}, null, 4),
      index: [{ label: randomDetector.indices[0] }], // Currently we support only one index
      shingleSize: SINGLE_ENTITY_SHINGLE_SIZE,
      timeField: randomDetector.timeField,
      detectionInterval: randomDetector.detectionInterval.period.interval,
      windowDelay: randomDetector.windowDelay.period.interval,
    });
  });
  test('should return if detector does not have metadata', () => {
    const randomDetector = getRandomDetector();
    //@ts-ignore
    randomDetector.uiMetadata = undefined;
    const adFormikValues = detectorDefinitionToFormik(randomDetector);
    expect(adFormikValues).toEqual({
      detectorName: randomDetector.name,
      detectorDescription: randomDetector.description,
      filters: [],
      filterType: FILTER_TYPES.CUSTOM,
      filterQuery: JSON.stringify(randomDetector.filterQuery || {}, null, 4),
      index: [{ label: randomDetector.indices[0] }], // Currently we support only one index
      shingleSize: SINGLE_ENTITY_SHINGLE_SIZE,
      timeField: randomDetector.timeField,
      detectionInterval: randomDetector.detectionInterval.period.interval,
      windowDelay: randomDetector.windowDelay.period.interval,
    });
  });
  test('should return if detector has categoryField', () => {
    let randomDetector = getRandomDetector();
    randomDetector.categoryField = ['field'];
    const adFormikValues = detectorDefinitionToFormik(randomDetector);
    expect(adFormikValues).toEqual({
      detectorName: randomDetector.name,
      detectorDescription: randomDetector.description,
      filters: [],
      filterType: FILTER_TYPES.SIMPLE,
      filterQuery: JSON.stringify(randomDetector.filterQuery || {}, null, 4),
      index: [{ label: randomDetector.indices[0] }], // Currently we support only one index
      shingleSize: MULTI_ENTITY_SHINGLE_SIZE,
      timeField: randomDetector.timeField,
      detectionInterval: randomDetector.detectionInterval.period.interval,
      windowDelay: randomDetector.windowDelay.period.interval,
    });
  });
});

describe('formikToAd', () => {
  test('should convert formikValues to API request model', () => {
    const randomDetector = getRandomDetector();
    const ad = formikToDetector(
      {
        ...INITIAL_DETECTOR_DEFINITION_VALUES,
        detectorName: randomDetector.name,
        detectorDescription: randomDetector.description,
        index: [{ label: randomDetector.indices[0] }],
        timeField: randomDetector.timeField,
        detectionInterval: randomDetector.detectionInterval.period.interval,
        windowDelay: randomDetector.windowDelay.period.interval,
      },
      {} as Detector
    );
    expect(ad).toEqual({
      name: randomDetector.name,
      description: randomDetector.description,
      indices: randomDetector.indices,
      filterQuery: { match_all: {} },
      uiMetadata: {
        features: {},
        filterType: FILTER_TYPES.SIMPLE,
        filters: [],
      },
      timeField: randomDetector.timeField,
      detectionInterval: {
        period: {
          interval: randomDetector.detectionInterval.period.interval,
          unit: UNITS.MINUTES,
        },
      },
      windowDelay: {
        period: {
          interval: randomDetector.windowDelay.period.interval,
          unit: UNITS.MINUTES,
        },
      },
    });
  });
  test('should convert formikValues to API call with filters', () => {
    const randomDetector = getRandomDetector();
    const ad = formikToDetector(
      {
        ...INITIAL_DETECTOR_DEFINITION_VALUES,
        detectorName: randomDetector.name,
        detectorDescription: randomDetector.description,
        index: [{ label: randomDetector.indices[0] }],
        timeField: randomDetector.timeField,
        filters: [
          {
            fieldInfo: [{ label: 'age', type: DATA_TYPES.NUMBER }],
            operator: OPERATORS_MAP.IS_NOT_NULL,
          },
        ],
        detectionInterval: randomDetector.detectionInterval.period.interval,
        windowDelay: randomDetector.windowDelay.period.interval,
      },
      {} as Detector
    );
    expect(ad).toEqual({
      name: randomDetector.name,
      description: randomDetector.description,
      indices: randomDetector.indices,
      filterQuery: {
        bool: {
          filter: [
            {
              exists: {
                field: 'age',
              },
            },
          ],
        },
      },
      uiMetadata: {
        features: {},
        filterType: FILTER_TYPES.SIMPLE,
        filters: [
          {
            fieldInfo: [{ label: 'age', type: DATA_TYPES.NUMBER }],
            operator: OPERATORS_MAP.IS_NOT_NULL,
          },
        ],
      },
      timeField: randomDetector.timeField,
      detectionInterval: {
        period: {
          interval: randomDetector.detectionInterval.period.interval,
          unit: UNITS.MINUTES,
        },
      },
      windowDelay: {
        period: {
          interval: randomDetector.windowDelay.period.interval,
          unit: UNITS.MINUTES,
        },
      },
    });
  });
});

describe('formikToFilterQuery', () => {
  const numericFieldName = [{ label: 'age', type: 'number' }];
  const textField = [{ label: 'city', type: 'text' }];
  const keywordField = [{ label: 'city.keyword', type: 'keyword' }];

  test.each([
    [
      numericFieldName,
      OPERATORS_MAP.IS,
      20,
      { bool: { filter: [{ term: { age: 20 } }] } },
    ],
    [
      textField,
      OPERATORS_MAP.IS,
      'Seattle',
      { bool: { filter: [{ match_phrase: { city: 'Seattle' } }] } },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_NOT,
      20,
      { bool: { filter: [{ bool: { must_not: { term: { age: 20 } } } }] } },
    ],
    [
      textField,
      OPERATORS_MAP.IS_NOT,
      'Seattle',
      {
        bool: {
          filter: [
            { bool: { must_not: { match_phrase: { city: 'Seattle' } } } },
          ],
        },
      },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_NULL,
      undefined,
      {
        bool: {
          filter: [{ bool: { must_not: { exists: { field: 'age' } } } }],
        },
      },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_NOT_NULL,
      undefined,
      { bool: { filter: [{ exists: { field: 'age' } }] } },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_GREATER,
      20,
      { bool: { filter: [{ range: { age: { gt: 20 } } }] } },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_GREATER_EQUAL,
      20,
      { bool: { filter: [{ range: { age: { gte: 20 } } }] } },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_LESS,
      20,
      { bool: { filter: [{ range: { age: { lt: 20 } } }] } },
    ],
    [
      numericFieldName,
      OPERATORS_MAP.IS_LESS_EQUAL,
      20,
      { bool: { filter: [{ range: { age: { lte: 20 } } }] } },
    ],
    [
      textField,
      OPERATORS_MAP.STARTS_WITH,
      'Se',
      { bool: { filter: [{ prefix: { city: 'Se' } }] } },
    ],
    [
      textField,
      OPERATORS_MAP.ENDS_WITH,
      'Se',
      { bool: { filter: [{ wildcard: { city: '*Se' } }] } },
    ],
    [
      textField,
      OPERATORS_MAP.CONTAINS,
      'Se',
      {
        bool: {
          filter: [{ query_string: { query: `*Se*`, default_field: 'city' } }],
        },
      },
    ],
    [
      keywordField,
      OPERATORS_MAP.CONTAINS,
      'Se',
      { bool: { filter: [{ wildcard: { 'city.keyword': '*Se*' } }] } },
    ],
    [
      textField,
      OPERATORS_MAP.NOT_CONTAINS,
      'Se',
      {
        bool: {
          filter: [
            {
              bool: {
                must_not: {
                  query_string: { query: `*Se*`, default_field: 'city' },
                },
              },
            },
          ],
        },
      },
    ],
  ])(
    '.formikToFilterQuery (%j,  %S)',
    //@ts-ignore
    (fieldInfo, operator, fieldValue, expected) => {
      expect(
        formikToFilterQuery([{ fieldInfo, operator, fieldValue }] as UIFilter[])
      ).toEqual(expected);
    }
  );
});

describe('featuresToFormik', () => {
  test('should able to add new feature', () => {
    const randomDetector = getRandomDetector(false);
    const newFeature: FeaturesFormikValues = {
      featureId: 'test-feature-id',
      aggregationBy: 'sum',
      aggregationOf: [{ label: 'bytes' }],
      featureEnabled: true,
      featureName: 'New feature',
      featureType: FEATURE_TYPE.SIMPLE,
      aggregationQuery: '',
    };
    const randomPositiveInt = Math.ceil(Math.random() * 100);
    const apiRequest = prepareDetector(
      [newFeature],
      randomPositiveInt,
      randomDetector,
      false
    );
    // expect(apiRequest.featureAttributes).toEqual([
    //   {
    //     featureId: newFeature.featureId,
    //     featureName: newFeature.featureName,
    //     featureEnabled: newFeature.featureEnabled,
    //     importance: 1,
    //     aggregationQuery: { new_feature: { sum: { field: 'bytes' } } },
    //   },
    //   ...randomDetector.featureAttributes,
    // ]);
  });
  // test('should able to edit feature', () => {
  //   const randomDetector = getRandomDetector(false);
  //   const featureToEdit = randomDetector.featureAttributes[0];
  //   const newFeature: FeaturesFormikValues = {
  //     aggregationBy: 'sum',
  //     aggregationOf: [{ label: 'bytes' }],
  //     enabled: true,
  //     featureName: 'New feature',
  //     featureType: FEATURE_TYPE.SIMPLE,
  //     customAggregation: '',
  //   };
  //   const apiRequest = prepareDetector(
  //     newFeature,
  //     randomDetector,
  //     featureToEdit.featureId || ''
  //   );
  //   expect(apiRequest.featureAttributes).toEqual([
  //     {
  //       featureId: featureToEdit.featureId,
  //       featureName: newFeature.featureName,
  //       featureEnabled: newFeature.enabled,
  //       importance: 1,
  //       aggregationQuery: { new_feature: { sum: { field: 'bytes' } } },
  //     },
  //     ...randomDetector.featureAttributes.slice(1),
  //   ]);
  // });
});
