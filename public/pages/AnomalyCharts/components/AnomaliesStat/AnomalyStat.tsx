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

import React, { Fragment } from 'react';
import { EuiIcon, EuiLink, EuiToolTip, EuiTitle } from '@elastic/eui';
import { Monitor } from '../../../../models/interfaces';
import { getAlertingMonitorListLink } from '../../../../utils/utils';
import { formatNumber } from '../../../utils/helpers';

interface AnomalyStatProps {
  title: any;
  description: any;
}

export const AnomalyStat = (props: AnomalyStatProps) => {
  return (
    <div className="euiStat euiStat--leftAligned">
      <div className="euiText euiText--small euiStat__description">
        {props.description}
      </div>
      <div
        className="euiTitle euiTitle--small euiStat__title"
        style={{ display: 'inline' }}
      >
        {props.title}
      </div>
    </div>
  );
};

export const AnomalyStatWithTooltip = (props: {
  isLoading: boolean;
  minValue: number | undefined;
  maxValue: number | undefined;
  description: string;
  tooltip: string;
}) => {
  const title = () => {
    return props.isLoading
      ? '-'
      : !props.maxValue
      ? '0'
      : `${formatNumber(props.minValue)}-${formatNumber(props.maxValue)}`;
  };
  const description = () => {
    return (
      <Fragment>
        <p>
          {props.description}{' '}
          <EuiToolTip position="top" content={props.tooltip}>
            <EuiIcon type="iInCircle" />
          </EuiToolTip>
        </p>
      </Fragment>
    );
  };
  return <AnomalyStat description={description()} title={title()} />;
};

export const AlertsStat = (props: {
  monitor: Monitor | undefined;
  showAlertsFlyout(): void;
  totalAlerts: number | undefined;
  isLoading: boolean;
}) => {
  const title = () => {
    return (
      <Fragment>
        <p
          className="euiTitle euiTitle--small euiStat__title"
          style={{ display: 'inline' }}
        >
          {props.totalAlerts === undefined || props.isLoading
            ? '-'
            : props.totalAlerts}{' '}
        </p>
        {props.monitor ? (
          <EuiLink
            href={`${getAlertingMonitorListLink()}/${
              // @ts-ignore
              props.monitor.id
            }`}
            target="_blank"
            style={{ fontSize: '14px' }}
          >
            View monitor <EuiIcon type="popout"></EuiIcon>
          </EuiLink>
        ) : null}
      </Fragment>
    );
  };

  const description = () => {
    return (
      <p>
        Alert{' '}
        <EuiLink onClick={props.showAlertsFlyout} style={{ fontSize: '12px' }}>
          Info
        </EuiLink>
      </p>
    );
  };

  return <AnomalyStat title={title()} description={description()} />;
};
