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
import { Monitor } from '../../../../models/interfaces';

interface MonitorsCalloutProps {
  monitors: Monitor[];
}

export const MonitorsCallout = (props: MonitorsCalloutProps) => {
  return (
    <EuiCallOut
      title="There are monitors associated with the selected detectors. 
      You will not be able to receive any anomaly results from the following monitors:"
      color="warning"
      iconType="alert"
    >
      <div>
        {props.monitors.map(monitor => {
          return (
            <li>
              <EuiLink
                href={`${getAlertingMonitorListLink()}/${monitor.id}`}
                target="_blank"
              >
                {monitor.name} <EuiIcon type="popout" size="s" />
              </EuiLink>{' '}
            </li>
          );
        })}
      </div>
    </EuiCallOut>
  );
};
