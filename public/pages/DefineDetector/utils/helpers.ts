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
  FILTER_TYPES,
  UNITS,
  Detector,
  UIFilter,
} from '../../../models/interfaces';
import { get, cloneDeep, isEmpty } from 'lodash';
import { DetectorDefinitionFormikValues } from '../../DefineDetector/models/interfaces';
import { INITIAL_DETECTOR_DEFINITION_VALUES } from '../../DefineDetector/utils/constants';
import {
  formikToIndices,
  formikToFilterQuery,
} from '../../ReviewAndCreate/utils/helpers';

export function detectorDefinitionToFormik(
  ad: Detector
): DetectorDefinitionFormikValues {
  const initialValues = cloneDeep(INITIAL_DETECTOR_DEFINITION_VALUES);
  if (isEmpty(ad)) return initialValues;

  return {
    ...initialValues,
    name: ad.name,
    description: ad.description,
    index: [{ label: ad.indices[0] }], // Currently we support only one index
    filters: filtersToFormik(ad),
    filterQuery: JSON.stringify(
      get(ad, 'filterQuery', { match_all: {} }),
      null,
      4
    ),
    timeField: ad.timeField,
    interval: get(ad, 'detectionInterval.period.interval', 10),
    windowDelay: get(ad, 'windowDelay.period.interval', 0),
    // shingleSize: getShingleSizeFromObject(
    //   ad,
    //   !isEmpty(get(ad, 'categoryField', []))
    // ),
  };
}

function filtersToFormik(detector: Detector): UIFilter[] {
  // Detectors created or updated using the API will not have metadata - create a custom filter in this case.
  const noMetadata =
    get(detector, 'uiMetadata.filterType') === undefined &&
    get(detector, 'uiMetadata.filters') === undefined;
  if (noMetadata) {
    return [
      {
        filterType: FILTER_TYPES.CUSTOM,
        query: JSON.stringify(
          get(detector, 'filterQuery', { match_all: {} }),
          null,
          4
        ),
      },
    ];
  }

  const curFilterType = get(detector, 'uiMetadata.filterType');
  const curFilters = get(detector, 'uiMetadata.filters', []);
  const curFilterQuery = JSON.stringify(
    get(detector, 'filterQuery', { match_all: {} }),
    null,
    4
  );

  // If this is an old detector (has a base filter type): modify it by injecting that
  // filter type into each existing filter
  if (curFilterType !== undefined) {
    curFilters.forEach((filter: UIFilter) => {
      return {
        ...filter,
        filterType: curFilterType,
        query:
          curFilterType === FILTER_TYPES.CUSTOM ? curFilterQuery : undefined,
      };
    });
  }
  return curFilters;
}

export function formikToDetectorDefinition(
  values: DetectorDefinitionFormikValues,
  detector: Detector
): Detector {
  let detectorBody = {
    ...detector,
    name: values.name,
    description: values.description,
    indices: formikToIndices(values.index),
    filterQuery: formikToFilterQuery(values),
    uiMetadata: {
      ...detector.uiMetadata,
      filters: get(values, 'filters', []),
    },
    timeField: values.timeField,
    detectionInterval: {
      period: { interval: values.interval, unit: UNITS.MINUTES },
    },
    windowDelay: {
      period: { interval: values.windowDelay, unit: UNITS.MINUTES },
    },
  } as Detector;

  return detectorBody;
}
