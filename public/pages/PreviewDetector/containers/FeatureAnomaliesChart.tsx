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

import {
  EuiEmptyPrompt,
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiSpacer,
  EuiButton,
} from '@elastic/eui';

import { get } from 'lodash';
import { FeatureChart } from '../components/FeatureChart/FeatureAnomaliesChart';
import {
  Detector,
  FeatureAttributes,
  AnomalyPreview,
} from '../../../models/interfaces';
import moment, { Moment } from 'moment';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { NoFeaturePrompt } from '../components/FeatureChart/NoFeaturePrompt';

interface FeatureAnomaliesChartProps {
  title?: string;
  detector: Detector;
  onCreateFeature(event: React.MouseEvent<HTMLButtonElement>): void;
  onUpdatePreview(): void;
  onEdit: (ev: React.MouseEvent<HTMLButtonElement>, featureId: string) => void;
  featureEditId: string;
  anomaliesResult: AnomalyPreview;
  annotations: any[];
  isLoading: boolean;
  startDateTime: Moment;
  endDateTime: Moment;
  featureDataSeriesName: string;
  featureAnomalyAnnotationSeriesName: string;
  showAnomalyAsBar: boolean;
}

export const FeatureAnomaliesChart = React.memo(
  (props: FeatureAnomaliesChartProps) => {
    return (
      <React.Fragment>
        {props.title ? (
          <EuiFlexGroup alignItems="flexEnd">
            <EuiFlexItem>
              <EuiTitle size="s" className="preview-title">
                <h4>{props.title}</h4>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
        ) : null}

        <EuiSpacer size="s" />
        {get(props, 'detector.featureAttributes', []).map(
          (feature: FeatureAttributes, index: number) => (
            <React.Fragment key={`${feature.featureName}-${feature.featureId}`}>
              <FeatureChart
                // title={feature.featureName}
                // enabled={feature.featureEnabled}
                feature={feature}
                featureData={get(
                  props,
                  `anomaliesResult.featureData.${feature.featureId}`,
                  []
                )}
                onEdit={(ev: any) => props.onEdit(ev, feature.featureId || '')}
                isEdit={feature.featureId === props.featureEditId}
                annotations={props.annotations}
                isLoading={props.isLoading}
                startDateTime={props.startDateTime}
                endDateTime={moment()}
                featureType={get(
                  props,
                  `detector.uiMetadata.features.${feature.featureName}.featureType`
                )}
                field={
                  get(
                    props,
                    `detector.uiMetadata.features.${feature.featureName}.featureType`
                  ) === 'simple_aggs'
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
                  ) === 'simple_aggs'
                    ? get(
                        props,
                        `detector.uiMetadata.features.${feature.featureName}.aggregationBy`
                      )
                    : undefined
                }
                featureDataSeriesName={props.featureDataSeriesName}
                featureAnomalyAnnotationSeriesName={
                  props.featureAnomalyAnnotationSeriesName
                }
                showAnomalyAsBar={props.showAnomalyAsBar}
              />
              <EuiSpacer />
            </React.Fragment>
          )
        )}
        {!props.isLoading &&
        get(props, 'detector.featureAttributes.length', 0) === 0 ? (
          <NoFeaturePrompt detectorId={props.detector.id}/>
        ) : null}
      </React.Fragment>
    );
  }
);
