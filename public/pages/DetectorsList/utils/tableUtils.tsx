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
import { EuiLink, EuiIcon, EuiToolTip } from '@elastic/eui';
import { PLUGIN_NAME } from '../../../utils/constants';
import { Detector } from '../../../../server/models/types';
//@ts-ignore
import moment from 'moment';

export const DEFAULT_EMPTY_DATA = '-';

const renderTime = (time: number) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return DEFAULT_EMPTY_DATA;
};

export const staticColumn = [
  {
    field: 'name',
    name: 'Detector name',
    sortable: true,
    truncateText: true,
    textOnly: true,
    width: '150px',
    render: (name: string, detector: Detector) => (
      <EuiLink href={`${PLUGIN_NAME}#/detectors/${detector.id}`}>
        {name}
      </EuiLink>
    ),
  },
  {
    field: 'totalAnomalies',
    name: (
      <EuiToolTip content="Total anomalies in last 24 hours">
        <span>
          Total anomalies{' '}
          <EuiIcon
            size="s"
            color="subdued"
            type="questionInCircle"
            className="eui-alignTop"
          />
        </span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'number',
    align: 'center',
    width: '100px',
  },
  {
    field: 'lastActiveAnomaly',
    name: (
      <EuiToolTip content="Last active anomaly time">
        <span>
          Last active anomaly{' '}
          <EuiIcon
            size="s"
            color="subdued"
            type="questionInCircle"
            className="eui-alignTop"
          />
        </span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'date',
    width: '100px',
    align: 'center',
    render: renderTime,
  },
];
