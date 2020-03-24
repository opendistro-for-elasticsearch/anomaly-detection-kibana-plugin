import chance from 'chance';
import { snakeCase } from 'lodash';
import {
  Detector,
  FeatureAttributes,
  FEATURE_TYPE,
  FILTER_TYPES,
  UiMetaData,
  UNITS,
} from '../../../models/interfaces';

const detectorFaker = new chance('seed');

export const getRandomFeature = (needsId: boolean): FeatureAttributes => {
  const featureName = detectorFaker.country();
  const feature = {
    featureName,
    featureEnabled: detectorFaker.bool(),
    importance: 2,
    aggregationQuery: {
      [snakeCase(featureName)]: {
        max: {
          field: 'any',
        },
      },
    },
  };
  if (needsId) {
    return { featureId: detectorFaker.guid().slice(0, 20), ...feature };
  } else {
    return feature;
  }
};

const randomQuery = () => {
  return {
    bool: {
      filter: [
        {
          exists: {
            field: 'host',
            boost: 1.0,
          },
        },
      ],
      adjust_pure_negative: true,
      boost: 1.0,
    },
  };
};

const getUIMetadata = (features: FeatureAttributes[]) => {
  const metaFeatures = features.reduce(
    (acc, feature) => ({
      ...acc,
      [feature.featureName]: {
        aggregationBy: detectorFaker.pickone(['max', 'min', 'sum', 'avg']),
        aggregationOf: feature.featureName,
        featureType: FEATURE_TYPE.SIMPLE,
      },
    }),
    {}
  );
  return {
    filterType: FILTER_TYPES.SIMPLE,
    features: metaFeatures,
    filters: [],
  } as UiMetaData;
};

export const getRandomDetector = (isCreate: boolean = true): Detector => {
  const features = new Array(detectorFaker.natural({ min: 1, max: 5 }))
    .fill(null)
    .map(() => getRandomFeature(isCreate ? false : true));
  return {
    id: isCreate ? detectorFaker.guid().slice(0, 20) : '',
    primaryTerm: isCreate ? 0 : detectorFaker.integer({ min: 1 }),
    seqNo: isCreate ? 0 : detectorFaker.integer({ min: 1 }),
    name: detectorFaker.word({ length: 10 }),
    description: detectorFaker.paragraph({ sentences: 1 }),
    timeField: '@timestamp',
    indices: ['logstash-*'],
    featureAttributes: features,
    filterQuery: randomQuery(),
    uiMetadata: getUIMetadata(features),
    detectionInterval: {
      period: {
        interval: detectorFaker.integer({ min: 1, max: 10 }),
        unit: UNITS.MINUTES,
      },
    },
    windowDelay: {
      period: {
        interval: detectorFaker.integer({ min: 1, max: 10 }),
        unit: UNITS.MINUTES,
      },
    },
  };
};
