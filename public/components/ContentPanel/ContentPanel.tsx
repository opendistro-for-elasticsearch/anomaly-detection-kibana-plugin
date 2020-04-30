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
  //@ts-ignore
  EuiTitleSize,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiTitle,
} from '@elastic/eui';

type ContentPanelProps = {
  // keep title string part for backwards compatibility
  // might need to refactor code and
  // deprecate support for 'string' in the near future
  title: string | React.ReactNode | React.ReactNode[];
  titleSize?: EuiTitleSize;
  subTitle?: React.ReactNode | React.ReactNode[];
  bodyStyles?: React.CSSProperties;
  panelStyles?: React.CSSProperties;
  horizontalRuleClassName?: string;
  titleClassName?: string;
  titleContainerStyles?: React.CSSProperties;
  actions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
  contentPanelClassName?: string;
};

const ContentPanel = (props: ContentPanelProps) => (
  <EuiPanel
    style={{ padding: '20px', ...props.panelStyles }}
    className={props.contentPanelClassName}
  >
    <EuiFlexGroup
      style={{ padding: '0px', ...props.titleContainerStyles }}
      justifyContent="spaceBetween"
      alignItems="center"
    >
      <EuiFlexItem>
        {typeof props.title === 'string' ? (
          <EuiTitle
            size={props.titleSize || 's'}
            className={props.titleClassName}
          >
            <h3>{props.title}</h3>
          </EuiTitle>
        ) : (
          <EuiFlexGroup justifyContent="flexStart" alignItems="center">
            {Array.isArray(props.title) ? (
              props.title.map(
                (titleComponent: React.ReactNode, idx: number) => (
                  <EuiFlexItem grow={false} key={idx}>
                    {titleComponent}
                  </EuiFlexItem>
                )
              )
            ) : (
              <EuiFlexItem>{props.title}</EuiFlexItem>
            )}
          </EuiFlexGroup>
        )}
        <EuiFlexGroup>
          {Array.isArray(props.subTitle) ? (
            props.subTitle.map(
              (subTitleComponent: React.ReactNode, idx: number) => (
                <EuiFlexItem grow={false} key={idx}>
                  {subTitleComponent}
                </EuiFlexItem>
              )
            )
          ) : (
            <EuiFlexItem>{props.subTitle}</EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          {Array.isArray(props.actions) ? (
            props.actions.map((action: React.ReactNode, idx: number) => (
              <EuiFlexItem key={idx}>{action}</EuiFlexItem>
            ))
          ) : (
            <EuiFlexItem>{props.actions}</EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
    {props.title != '' && (
      <EuiHorizontalRule
        margin="xs"
        className={props.horizontalRuleClassName}
      />
    )}
    <div style={{ padding: '10px 0px', ...props.bodyStyles }}>
      {props.children}
    </div>
  </EuiPanel>
);

export default ContentPanel;
