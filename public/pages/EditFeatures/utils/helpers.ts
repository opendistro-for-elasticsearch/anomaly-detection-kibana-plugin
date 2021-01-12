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

import {
  DATA_TYPES,
  MULTI_ENTITY_SHINGLE_SIZE,
  SINGLE_ENTITY_SHINGLE_SIZE,
} from '../../../utils/constants';
import {
  FEATURE_TYPE,
  FeatureAttributes,
  Detector,
} from '../../../models/interfaces';
import { v4 as uuidv4 } from 'uuid';
import { get, forOwn } from 'lodash';
import { FeaturesFormikValues } from '../containers/utils/formikToFeatures';
import { DataTypes } from '../../../redux/reducers/elasticsearch';

export const getFieldOptions = (
  allFields: { [key: string]: string[] },
  validTypes: DATA_TYPES[]
) =>
  validTypes
    .map((dataType) =>
      allFields[dataType]
        ? {
            label: dataType,
            options: allFields[dataType].map((field) => ({
              label: field,
              type: dataType,
            })),
          }
        : []
    )
    .filter(Boolean);

export const getNumberFieldOptions = (allFields: { [key: string]: string[] }) =>
  getFieldOptions(allFields, [DATA_TYPES.NUMBER]);

export const getCountableFieldOptions = (allFields: {
  [key: string]: string[];
}) => {
  const countableDataTypes = [
    DATA_TYPES.NUMBER,
    DATA_TYPES.BOOLEAN,
    DATA_TYPES.KEYWORD,
    DATA_TYPES.DATE,
  ];
  return getFieldOptions(
    allFields,
    Object.keys(allFields)
      .map((field) => field as DATA_TYPES)
      .filter((field) => countableDataTypes.includes(field))
  );
};

export const initialFeatureValue = () => ({
  featureId: uuidv4(),
  featureName: undefined,
  featureType: FEATURE_TYPE.SIMPLE,
  featureEnabled: true,
  importance: 1,
  aggregationBy: 'sum',
  aggregationQuery: JSON.stringify(
    {
      aggregation_name: { sum: { field: 'field_name' } },
    },
    null,
    4
  ),
  newFeature: true,
});

export const validateFeatures = (values: any) => {
  const featureList = get(values, 'featureList', []);
  let featureNameCount = new Map<string, number>();

  featureList.forEach((attribute: FeatureAttributes) => {
    if (attribute.featureName) {
      const featureName = attribute.featureName.toLowerCase();
      if (featureNameCount.has(featureName)) {
        featureNameCount.set(
          featureName,
          // @ts-ignore
          featureNameCount.get(featureName) + 1
        );
      } else {
        featureNameCount.set(featureName, 1);
      }
    }
  });

  let hasError = false;
  const featureErrors = featureList.map((attribute: FeatureAttributes) => {
    if (attribute.featureName) {
      // @ts-ignore
      if (featureNameCount.get(attribute.featureName.toLowerCase()) > 1) {
        hasError = true;
        return { featureName: 'Duplicate feature name' };
      } else {
        return undefined;
      }
    } else {
      hasError = true;
      // @ts-ignore
      return {
        featureName: 'You must enter a feature name',
      };
    }
  });
  return hasError ? { featureList: featureErrors } : undefined;
};

export const generateInitialFeatures = (
  detector: Detector
): FeaturesFormikValues[] => {
  const featureUiMetaData = get(detector, 'uiMetadata.features', []);
  const features = get(detector, 'featureAttributes', []);
  // @ts-ignore
  return features.map((feature: FeatureAttributes) => {
    return {
      ...featureUiMetaData[feature.featureName],
      ...feature,
      aggregationQuery: JSON.stringify(feature['aggregationQuery'], null, 4),
      aggregationOf: get(
        featureUiMetaData,
        `${feature.featureName}.aggregationOf`
      )
        ? [
            {
              label: get(
                featureUiMetaData,
                `${feature.featureName}.aggregationOf`
              ),
            },
          ]
        : [],
      featureType: get(featureUiMetaData, `${feature.featureName}.featureType`)
        ? get(featureUiMetaData, `${feature.featureName}.featureType`)
        : FEATURE_TYPE.CUSTOM,
    };
  });
};

export const focusOnFirstWrongFeature = (errors: any, setFieldTouched: any) => {
  if (
    //@ts-ignore
    !!get(errors, 'featureList', []).filter((featureError) => featureError)
      .length
  ) {
    const featureList = get(errors, 'featureList', []);
    for (let i = featureList.length - 1; i >= 0; i--) {
      if (featureList[i]) {
        forOwn(featureList[i], function (value, key) {
          setFieldTouched(`featureList.${i}.${key}`, true);
        });
        focusOnFeatureAccordion(i);
      }
    }
    return true;
  }
  return false;
};

export const focusOnFeatureAccordion = (index: number) => {
  const featureAccordion = document.getElementById(
    `featureAccordionHeaders.${index}`
  );
  //@ts-ignore
  featureAccordion.setAttribute('tabindex', '-1');
  //@ts-ignore
  featureAccordion.focus();
  const header =
    //@ts-ignore
    featureAccordion.parentElement.parentElement.parentElement.parentElement;
  //@ts-ignore
  if (!header.className.includes('euiAccordion-isOpen')) {
    //@ts-ignore
    featureAccordion.click();
  }
};

export const focusOnCategoryField = () => {
  const component = document.getElementById('categoryFieldCheckbox');
  component?.focus();
};

export const getCategoryFields = (dataTypes: DataTypes) => {
  const keywordFields = get(dataTypes, 'keyword', []);
  const ipFields = get(dataTypes, 'ip', []);
  return keywordFields.concat(ipFields);
};

export const getShingleSizeFromObject = (
  obj: object,
  isHCDetector: boolean
) => {
  return get(
    obj,
    'shingleSize',
    isHCDetector ? MULTI_ENTITY_SHINGLE_SIZE : SINGLE_ENTITY_SHINGLE_SIZE
  );
};
