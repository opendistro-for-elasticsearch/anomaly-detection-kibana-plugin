import chance from 'chance';
import { snakeCase } from 'lodash';
import {
  Detector,
  FeatureAttributes,
  FEATURE_TYPE,
  FILTER_TYPES,
  UiMetaData,
  UNITS,
  Monitor,
} from '../../../models/interfaces';
import moment from 'moment';
import { DETECTOR_STATE } from '../../../utils/constants';

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
    lastUpdateTime: 1586823218000,
    enabled: true,
    enabledTime: 1586823218000,
    disabledTime: moment(1586823218000)
      .subtract(1, 'days')
      .valueOf(),
    curState: DETECTOR_STATE.INIT,
    stateError: '',
  };
};

export const getRandomMonitor = (
  detectorId: string,
  enabled: boolean = true
): Monitor => {
  return {
    id: detectorFaker.guid().slice(0, 20),
    name: detectorFaker.word({ length: 10 }),
    enabled: enabled,
    enabledTime: moment(1586823218000)
      .subtract(1, 'days')
      .valueOf(),
    schedule: {
      period: {
        interval: detectorFaker.integer({ min: 1, max: 10 }),
        unit: UNITS.MINUTES,
      },
    },
    inputs: [
      {
        search: {
          indices: ['.opendistro-anomaly-results*'],
          query: {
            size: 1,
            query: {
              bool: {
                filter: [
                  {
                    range: {
                      data_end_time: {
                        from: '{{period_end}}||-2m',
                        to: '{{period_end}}',
                        include_lower: true,
                        include_upper: true,
                        boost: 1.0,
                      },
                    },
                  },
                  {
                    term: {
                      detector_id: {
                        value: detectorId,
                        boost: 1.0,
                      },
                    },
                  },
                ],
                adjust_pure_negative: true,
                boost: 1.0,
              },
            },
            sort: [
              {
                anomaly_grade: {
                  order: 'desc',
                },
              },
              {
                confidence: {
                  order: 'desc',
                },
              },
            ],
            aggregations: {
              max_anomaly_grade: {
                max: {
                  field: 'anomaly_grade',
                },
              },
            },
          },
        },
      },
    ],
    triggers: [], //We don't need triggger for AD testing
    lastUpdateTime: moment(1586823218000)
      .subtract(1, 'days')
      .valueOf(),
  };
};
