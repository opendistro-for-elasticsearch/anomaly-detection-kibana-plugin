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

import { EuiButton, EuiButtonProps } from '@elastic/eui';
import React, { Fragment } from 'react';
//@ts-ignore
import { toastNotifications } from 'ui/notify';
import {
  getAlertingCreateMonitorLink,
  getAlertingMonitorListLink,
} from '../../../../utils/utils';
import { Monitor } from '../../../../models/interfaces';

export interface SetUpAlertsButtonProps extends EuiButtonProps {
  monitor?: Monitor;
  detectorId: string;
  detectorName: string;
  detectorInterval: number;
  unit: string;
}

export const SetUpAlertsButton = (props: SetUpAlertsButtonProps) => (
  <Fragment>
    {props.monitor ? (
      <EuiButton
        href={`${getAlertingMonitorListLink()}/${props.monitor.id}`}
        {...props}
      >
        Edit alert settings
      </EuiButton>
    ) : (
      <EuiButton
        href={`${getAlertingCreateMonitorLink(
          props.detectorId,
          props.detectorName,
          props.detectorInterval,
        //   props.unit,
          props.unit.toUpperCase(),
        )}`}
        {...props}
      >
        Set up alerts
      </EuiButton>
    )}
    {/* <EuiButton
             href={`${getAlertingCreateMonitorLink(
               props.detectorId,
               props.detectorName,
               props.detectorInterval,
               props.unit
             )}`}
             isDisabled={!!props.monitor}
             {...props}
           >
             Set up alerts
           </EuiButton> */}
  </Fragment>
);
