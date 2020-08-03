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
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EuiLink,
} from '@elastic/eui';
import { PLUGIN_NAME } from '../../../../utils/constants';

interface SampleDataBoxProps {
  title: string;
  icon: any;
  description: string;
  onLoadData(): void;
  isLoadingData: boolean;
  isDataLoaded: boolean;
  detectorId: string;
}

export const SampleDataBox = (props: SampleDataBoxProps) => {
  return (
    <div style={{ height: 'auto' }}>
      <ContentPanel
        title={
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignContent: 'flexStart',
            }}
          >
            {props.icon}
            <EuiSpacer size="m" />
            <h2>&nbsp;&nbsp;</h2>
            <EuiTitle size="s">
              <h2 style={{ marginTop: '-3px' }}>{props.title}</h2>
            </EuiTitle>
          </div>
        }
        titleSize="s"
        badgeLabel={props.isDataLoaded ? 'INSTALLED' : undefined}
      >
        <EuiFlexGroup direction="column" gutterSize="l">
          <EuiFlexItem>
            <p style={{ lineHeight: 1.4 }}>{props.description}</p>
          </EuiFlexItem>
          <EuiFlexGroup
            justifyContent="flexEnd"
            style={{
              paddingTop: '8px',
              paddingRight: '8px',
            }}
          >
            {props.isDataLoaded ? (
              <EuiFlexItem style={{ paddingLeft: '12px', paddingTop: '12px' }}>
                <EuiLink href={`${PLUGIN_NAME}#/detectors/${props.detectorId}`}>
                  View detector
                </EuiLink>
              </EuiFlexItem>
            ) : null}
            <EuiFlexItem grow={false}>
              <EuiButton
                data-test-subj="loadDataButton"
                disabled={props.isLoadingData || props.isDataLoaded}
                isLoading={props.isLoadingData}
                onClick={() => {
                  props.onLoadData();
                }}
              >
                {props.isDataLoaded ? 'Detector created' : 'Create detector'}
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </ContentPanel>
    </div>
  );
};
