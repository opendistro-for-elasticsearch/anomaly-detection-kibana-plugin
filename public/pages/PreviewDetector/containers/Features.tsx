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
import { FeatureChart } from '../components/FeatureChart/FeatureChart';
import {
  Detector,
  FeatureAttributes,
  AnomalyPreview,
} from '../../../models/interfaces';
import { Moment } from 'moment';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';

interface FeatureDetailsProps {
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
}

export const FeatureDetails = React.memo((props: FeatureDetailsProps) => {
  return (
    <React.Fragment>
      <EuiFlexGroup alignItems="flexEnd">
        <EuiFlexItem>
          <EuiTitle size="s" className="preview-title">
            <h4>
              Features ({get(props.detector, 'featureAttributes.length', 0)})
            </h4>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      {get(props, 'detector.featureAttributes', []).map(
        (feature: FeatureAttributes) => (
          <React.Fragment key={`${feature.featureName}-${feature.featureId}`}>
            <FeatureChart
              title={feature.featureName}
              enabled={feature.featureEnabled}
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
              endDateTime={props.endDateTime}
            />
            <EuiSpacer />
          </React.Fragment>
        )
      )}
      {!props.isLoading &&
      get(props, 'detector.featureAttributes.length', 0) === 0 ? (
        <ContentPanel title="">
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiEmptyPrompt
                body={
                  <EuiText>
                    No features have been added to this anomaly detector. A
                    feature is a metric that used for anomaly detection. A
                    detector can discover anomalies across one or many features.
                    This system reports an anomaly score based on how strong a
                    signal might be.
                  </EuiText>
                }
                actions={[
                  <EuiButton
                    data-test-subj="createButton"
                    onClick={props.onCreateFeature}
                  >
                    Add feature
                  </EuiButton>,
                ]}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </ContentPanel>
      ) : null}
    </React.Fragment>
  );
});
