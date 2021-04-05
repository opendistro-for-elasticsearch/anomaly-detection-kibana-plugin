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

import {
  FEATURE_TYPE,
  FILTER_TYPES,
  UNITS,
  FeatureAttributes,
  Detector,
  UiFeature,
} from '../../../models/interfaces';
import moment from 'moment';
import { get, isEmpty, snakeCase } from 'lodash';
import { DetectorDefinitionFormikValues } from '../../DefineDetector/models/interfaces';
import { FeaturesFormikValues } from '../../ConfigureModel/models/interfaces';
import { CreateDetectorFormikValues } from '../../CreateDetectorSteps/models/interfaces';
import { OPERATORS_QUERY_MAP } from '../../DefineDetector/utils/whereFilters';
import { convertTimestampToNumber } from '../../../utils/utils';

export function formikToDetector(values: CreateDetectorFormikValues): Detector {
  const detectionDateRange = values.historical
    ? {
        startTime: convertTimestampToNumber(values.startTime),
        endTime: convertTimestampToNumber(values.endTime),
      }
    : undefined;
  let detectorBody = {
    name: values.name,
    description: values.description,
    indices: formikToIndices(values.index),
    filterQuery: formikToFilterQuery(values),
    uiMetadata: {
      features: { ...featuresToUIMetadata(values.featureList) },
      filters: get(values, 'filters', []),
    },
    featureAttributes: formikToFeatureAttributes(values.featureList),
    timeField: values.timeField,
    detectionInterval: {
      period: { interval: values.interval, unit: UNITS.MINUTES },
    },
    windowDelay: {
      period: { interval: values.windowDelay, unit: UNITS.MINUTES },
    },
    shingleSize: values.shingleSize,
    categoryField: !isEmpty(values?.categoryField)
      ? values.categoryField
      : undefined,
  } as Detector;

  // Optionally add detection date range
  if (detectionDateRange) {
    detectorBody = {
      ...detectorBody,
      //@ts-ignore
      detectionDateRange: detectionDateRange,
    };
  }

  return detectorBody;
}

export const formikToIndices = (indices: { label: string }[]) =>
  indices.map((index) => index.label);

export const formikToFilterQuery = (
  values: CreateDetectorFormikValues | DetectorDefinitionFormikValues
) => {
  let filterQuery = {};
  const filters = get(values, 'filters', []);

  // If we have filters: need to combine into a single filter query.
  // Need to handle each filter type differently when converting
  if (filters.length > 0) {
    let filterArr = [] as any[];
    filters.forEach((filter) => {
      if (filter.filterType === FILTER_TYPES.SIMPLE) {
        filterArr.push(
          //@ts-ignore
          OPERATORS_QUERY_MAP[filter.operator]?.query(filter)
        );
      } else {
        filterArr.push(
          //@ts-ignore
          JSON.parse(filter.query)
        );
      }
    });
    filterQuery = {
      bool: {
        filter: [...filterArr],
      },
    };
  } else {
    filterQuery = { match_all: {} };
  }
  return filterQuery;
};

export function formikToFeatureAttributes(
  values: FeaturesFormikValues[],
  forPreview: boolean = false
): FeatureAttributes[] {
  //@ts-ignore
  return values.map(function (value) {
    const id = forPreview
      ? value.featureId
      : value.newFeature
      ? undefined
      : value.featureId;
    return {
      featureId: id,
      featureName: value.featureName,
      featureEnabled: value.featureEnabled,
      importance: 1,
      aggregationQuery: formikToAggregation(value),
    };
  });
}

export function featuresToUIMetadata(values: FeaturesFormikValues[]) {
  // TODO:: Delete Stale metadata if name is changed
  let features: {
    [key: string]: UiFeature;
  } = {};
  values.forEach((value) => {
    if (value.featureType === FEATURE_TYPE.SIMPLE) {
      features[value.featureName] = {
        featureType: value.featureType,
        aggregationBy: value.aggregationBy,
        aggregationOf:
          value.aggregationOf && value.aggregationOf.length
            ? value.aggregationOf[0].label
            : undefined,
      };
    } else {
      features[value.featureName] = {
        featureType: value.featureType,
      };
    }
  });
  return features;
}

export function formikToAggregation(values: FeaturesFormikValues) {
  if (values.featureType === FEATURE_TYPE.SIMPLE) {
    return values.aggregationBy &&
      values.aggregationOf &&
      values.aggregationOf.length > 0
      ? {
          [snakeCase(values.featureName)]: {
            [values.aggregationBy]: { field: values.aggregationOf[0].label },
          },
        }
      : {};
  }
  return JSON.parse(values.aggregationQuery);
}

export function toStringConfigCell(obj: any): string {
  if (typeof obj != 'undefined') {
    if (obj.hasOwnProperty('period')) {
      let period = obj.period;
      return period.interval + ' ' + period.unit;
    } else if (typeof obj == 'number') {
      // epoch
      return moment(obj).format('MM/DD/YY hh:mm A');
    }
  }
  return '-';
}
