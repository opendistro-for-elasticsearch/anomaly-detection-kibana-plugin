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

import {
  EuiLink,
  EuiText,
  EuiToolTip,
  EuiHealth,
  EuiBasicTableColumn,
} from '@elastic/eui';
//@ts-ignore
import moment from 'moment';
import React from 'react';
import { get } from 'lodash';
import { Detector } from '../../../models/interfaces';
import { PLUGIN_NAME } from '../../../utils/constants';
import { DETECTOR_STATE } from '../../../../server/utils/constants';
import { stateToColorMap } from '../../utils/constants';

const DEFAULT_EMPTY_DATA = '-';
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

const renderState = (state: DETECTOR_STATE) => {
  return (
    //@ts-ignore
    <EuiHealth color={stateToColorMap.get(state)}>{state}</EuiHealth>
  );
};

export const historicalDetectorListColumns = [
  {
    field: 'name',
    name: (
      <EuiToolTip content="The name of the historical detector">
        <span style={columnStyle}>Detector{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    truncateText: false,
    textOnly: true,
    align: 'left',
    render: (name: string, detector: Detector) => (
      <EuiLink
        href={`${PLUGIN_NAME}#/historical-detectors/${detector.id}/details`}
      >
        {name}
      </EuiLink>
    ),
  },
  {
    field: 'curState',
    name: (
      <EuiToolTip content="The current state of the detector">
        <span style={columnStyle}>State{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'string',
    align: 'left',
    truncateText: false,
    render: renderState,
  },
  {
    field: 'indices',
    name: (
      <EuiToolTip content="The index used by the detector">
        <span style={columnStyle}>Index{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'string',
    align: 'left',
    truncateText: false,
    render: (indices: string[]) => get(indices, '0', '-'),
  },
  {
    field: 'totalAnomalies',
    name: (
      <EuiToolTip content="The total number of anomalies found">
        <span style={columnStyle}>No. of anomalies{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'string',
    align: 'left',
    truncateText: false,
  },
  {
    field: 'dataStartTime',
    name: (
      <EuiToolTip content="The detection start time">
        <span style={columnStyle}>Start time{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'date',
    truncateText: false,
    align: 'left',
    render: renderTime,
  },
  {
    field: 'dataEndTime',
    name: (
      <EuiToolTip content="The detection end time">
        <span style={columnStyle}>End time{''}</span>
      </EuiToolTip>
    ),
    sortable: true,
    dataType: 'date',
    truncateText: false,
    align: 'left',
    render: renderTime,
  },
] as EuiBasicTableColumn<any>[];
