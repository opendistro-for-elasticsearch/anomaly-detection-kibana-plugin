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
  EuiLink,
} from '@elastic/eui';
import { PLUGIN_NAME } from '../../../../utils/constants';

interface SampleDataBoxProps {
  title: string;
  icon: any;
  description: string;
  loadDataButtonDescription: string;
  onOpenFlyout(): void;
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
            <EuiTitle size="s">
              <h2 style={{ marginLeft: '12px', marginTop: '-3px' }}>
                {props.title}
              </h2>
            </EuiTitle>
            <EuiLink
              style={{ marginLeft: '12px' }}
              onClick={props.onOpenFlyout}
            >
              Info
            </EuiLink>
          </div>
        }
        titleSize="s"
        badgeLabel={props.isDataLoaded ? 'INSTALLED' : undefined}
      >
        <EuiFlexGroup direction="column" gutterSize="l">
          <EuiFlexItem grow={false} style={{ height: '70px' }}>
            <p
              style={{
                textAlign: 'left',
                lineHeight: 1.4,
                maxHeight: 4.2,
              }}
            >
              {props.description}
            </p>
          </EuiFlexItem>
          <EuiFlexGroup
            style={{
              height: '100px',
              marginTop: '0px',
              marginBottom: '0px',
            }}
            direction="column"
            alignItems="center"
          >
            <EuiFlexItem grow={false}>
              <EuiButton
                style={{ width: '300px' }}
                data-test-subj="loadDataButton"
                disabled={props.isLoadingData || props.isDataLoaded}
                isLoading={props.isLoadingData}
                onClick={() => {
                  props.onLoadData();
                }}
              >
                {props.isLoadingData
                  ? 'Creating detector'
                  : props.isDataLoaded
                  ? 'Detector created'
                  : props.loadDataButtonDescription}
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {props.isDataLoaded ? (
                <EuiLink href={`${PLUGIN_NAME}#/detectors/${props.detectorId}`}>
                  View detector and sample data
                </EuiLink>
              ) : null}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </ContentPanel>
    </div>
  );
};
