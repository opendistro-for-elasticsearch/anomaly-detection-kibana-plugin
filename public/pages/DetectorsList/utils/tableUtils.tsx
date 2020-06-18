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

import {
  EuiLink,
  EuiToolTip,
  EuiHealth,
  EuiBasicTableColumn,
} from '@elastic/eui';
//@ts-ignore
import moment from 'moment';
import get from 'lodash/get';
import React from 'react';
import { Detector } from '../../../models/interfaces';
import { PLUGIN_NAME, DETECTOR_STATE } from '../../../utils/constants';
import { stateToColorMap } from '../../utils/constants';

export const DEFAULT_EMPTY_DATA = '-';
const columnStyle = {
  overflow: 'visible',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
} as React.CSSProperties;

const renderTime = (time: number) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid())
    return momentTime.format('MM/DD/YYYY h:mm A');
  return DEFAULT_EMPTY_DATA;
};

const renderIndices = (indices: string[]) => {
  return get(indices, '0', DEFAULT_EMPTY_DATA);
};

const renderState = (state: DETECTOR_STATE) => {
  return (
    //@ts-ignore
    <EuiHealth color={stateToColorMap.get(state)}>{state}</EuiHealth>
  );
};

export const staticColumn = [
  {
    field: 'name',
    name: (
      <EuiToolTip content="The name of the detector">
        <span style={columnStyle}>Detector{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    truncateText: true,
    textOnly: true,
    align: 'left',
    width: '15%',
    render: (name: string, detector: Detector) => (
      <EuiLink href={`${PLUGIN_NAME}#/detectors/${detector.id}`}>
        {name}
      </EuiLink>
    ),
  },
  {
    field: 'indices',
    name: (
      <EuiToolTip content="The index or index pattern used for the detector">
        <span style={columnStyle}>Indices{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    truncateText: true,
    textOnly: true,
    align: 'left',
    width: '15%',
    render: renderIndices,
  },
  {
    field: 'curState',
    name: (
      <EuiToolTip content="The current state of the detector">
        <span style={columnStyle}>Detector state{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'string',
    align: 'left',
    width: '12%',
    truncateText: false,
    render: renderState,
  },
  {
    field: 'totalAnomalies',
    name: (
      <EuiToolTip content="Total anomalies with a grade > 0 in last 24 hours">
        <span style={columnStyle}>Anomalies last 24 hours{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'number',
    align: 'right',
    width: '16%',
    truncateText: false,
  },
  {
    field: 'lastActiveAnomaly',
    name: (
      <EuiToolTip content="Time of the last active anomaly with a grade > 0">
        <span style={columnStyle}>Last anomaly occurrence{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'date',
    truncateText: false,
    align: 'left',
    width: '16%',
    render: renderTime,
  },
  {
    field: 'enabledTime',
    name: (
      <EuiToolTip content="The time the detector was last enabled">
        <span style={columnStyle}>Last enabled time{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'date',
    truncateText: false,
    align: 'left',
    width: '16%',
    render: renderTime,
  },
] as EuiBasicTableColumn<any>[];
