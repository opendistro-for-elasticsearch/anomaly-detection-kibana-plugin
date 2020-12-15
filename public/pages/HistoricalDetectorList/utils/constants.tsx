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

import { EuiLink, EuiToolTip, EuiBasicTableColumn } from '@elastic/eui';
//@ts-ignore
import moment from 'moment';
import React from 'react';
import { Detector } from '../../../models/interfaces';
import { PLUGIN_NAME } from '../../../utils/constants';
import {
  columnStyle,
  renderTime,
  renderState,
  renderIndices,
} from '../../DetectorsList/utils/tableUtils';

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
    render: renderIndices,
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
