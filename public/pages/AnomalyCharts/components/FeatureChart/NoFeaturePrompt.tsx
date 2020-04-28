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
  EuiButton,
} from '@elastic/eui';

import ContentPanel from '../../../../components/ContentPanel/ContentPanel';

interface NoFeaturePromptProps {
  detectorId: string;
}

export const NoFeaturePrompt = (props: NoFeaturePromptProps) => {
  return (
    <React.Fragment>
      <ContentPanel
        title=''
        titleSize="xs"
        titleClassName="preview-title"
      >
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
                  href={`#/detectors/${props.detectorId}/features`}
                >
                  Add feature
                </EuiButton>,
              ]}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentPanel>
    </React.Fragment>
  );
};
