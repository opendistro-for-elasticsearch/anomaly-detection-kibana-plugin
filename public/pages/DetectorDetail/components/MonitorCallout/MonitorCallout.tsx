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
import { EuiCallOut, EuiLink, EuiIcon } from '@elastic/eui';
// @ts-ignore
import { toastNotifications } from 'ui/notify';
//@ts-ignore
import chrome from 'ui/chrome';
import { getAlertingMonitorListLink } from '../../../../utils/utils';

interface MonitorCalloutProps {
  monitorId: string;
  monitorName: string;
}

export const MonitorCallout = (props: MonitorCalloutProps) => {
  return (
    <EuiCallOut
      title="The monitor associated with this detector will not receive any anomaly results"
      color="warning"
      iconType="alert"
    >
      <p>
        Once a detector is stopped, monitor{' '}
        <EuiLink
          href={`${getAlertingMonitorListLink()}/${props.monitorId}`}
          target="_blank"
        >
          {props.monitorName} <EuiIcon type="popout" size="s" />
        </EuiLink>{' '}
        associated with this detector will not receive any anomaly results to
        generate alerts.
      </p>
    </EuiCallOut>
  );
};
