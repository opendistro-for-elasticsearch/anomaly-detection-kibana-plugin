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
import { get } from 'lodash';
import { EuiFlexItem, EuiFlexGroup, EuiTitle, EuiSpacer } from '@elastic/eui';
import { FeatureChart } from '../components/FeatureChart/FeatureChart';
import {
  Detector,
  FeatureAttributes,
  AnomalyPreview,
  DateRange,
  FEATURE_TYPE,
} from '../../../models/interfaces';
import { NoFeaturePrompt } from '../components/FeatureChart/NoFeaturePrompt';
import { focusOnFeatureAccordion } from '../../EditFeatures/utils/helpers';

interface FeatureBreakDownProps {
  title?: string;
  detector: Detector;
  anomaliesResult: AnomalyPreview;
  annotations: any[];
  isLoading: boolean;
  dateRange: DateRange;
  featureDataSeriesName: string;
}

export const FeatureBreakDown = React.memo((props: FeatureBreakDownProps) => {
  return (
    <React.Fragment>
      {props.title ? (
        <EuiFlexGroup alignItems="flexEnd">
          <EuiFlexItem>
            <EuiTitle size="s" className="preview-title">
              <h4>{props.title}</h4>
            </EuiTitle>
          <EuiSpacer size="s" />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : null}

      {get(props, 'detector.featureAttributes', []).map(
        (feature: FeatureAttributes, index: number) => (
          <React.Fragment key={`${feature.featureName}-${feature.featureId}`}>
            <FeatureChart
              feature={feature}
              featureData={get(
                props,
                `anomaliesResult.featureData.${feature.featureId}`,
                []
              )}
              annotations={props.annotations}
              isLoading={props.isLoading}
              dateRange={props.dateRange}
              featureType={
                get(
                  props,
                  `detector.uiMetadata.features.${feature.featureName}.featureType`
                ) as FEATURE_TYPE
              }
              field={
                get(
                  props,
                  `detector.uiMetadata.features.${feature.featureName}.featureType`
                ) === FEATURE_TYPE.SIMPLE
                  ? get(
                      props,
                      `detector.uiMetadata.features.${feature.featureName}.aggregationOf`
                    )
                  : undefined
              }
              aggregationMethod={
                get(
                  props,
                  `detector.uiMetadata.features.${feature.featureName}.featureType`
                ) === FEATURE_TYPE.SIMPLE
                  ? get(
                      props,
                      `detector.uiMetadata.features.${feature.featureName}.aggregationBy`
                    )
                  : undefined
              }
              featureDataSeriesName={props.featureDataSeriesName}
              edit={props.title === 'Sample feature breakdown'}
              onEdit={() => {
                focusOnFeatureAccordion(index);
              }}
            />
            <EuiSpacer size='m'/>
          </React.Fragment>
        )
      )}
      {!props.isLoading &&
      get(props, 'detector.featureAttributes.length', 0) === 0 ? (
        <NoFeaturePrompt detectorId={props.detector.id} />
      ) : null}
    </React.Fragment>
  );
});
