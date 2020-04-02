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

import { EuiIcon, EuiLink, EuiToolTip } from '@elastic/eui';
//@ts-ignore
import moment from 'moment';
import React from 'react';
import { Detector } from '../../../../server/models/types';
import { PLUGIN_NAME } from '../../../utils/constants';

export const DEFAULT_EMPTY_DATA = '-';

const renderTime = (time: number) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return DEFAULT_EMPTY_DATA;
};

const renderLastUpdateTime = (lastUpdateTime: number, detector: Detector) => {
  const momentTime = moment(detector.lastUpdateTime);
  if (detector.lastUpdateTime && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm A');
  return DEFAULT_EMPTY_DATA;
};

const renderIndices = (indices: string[], detector: Detector) => {
  if (detector == null || detector.indices == null || detector.indices.length == 0) return DEFAULT_EMPTY_DATA;
  return detector.indices[0];
};

// TODO: may not need a separate render fn since it will probably just be a value
const renderState = (state: string, detector: Detector) => {
  return '<state placeholder>'
};

export const staticColumn = [
  {
    field: 'name',
    name: (
      <EuiToolTip content="The name of the detector">
        <span>
          Detector{' '}
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
    truncateText: true,
    textOnly: true,
    align: 'left',
    width: '150px',
    render: (name: string, detector: Detector) => (
      <EuiLink href={`${PLUGIN_NAME}#/detectors/${detector.id}/features/`}>
        {name}
      </EuiLink>
    ),
  },
  {
    field: 'indices',
    name: (
      <EuiToolTip content="The index or index pattern the detector is detecting over">
        <span>
          Indices{' '}
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
    truncateText: true,
    textOnly: true,
    align: 'left',
    width: '150px',
    render: renderIndices
  },
  {
    field: 'curState',
    name: (
      <EuiToolTip content="The current state of the detector">
        <span>
          Detector state{' '}
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
    dataType: 'string',
    align: 'left',
    width: '100px',
    render: renderState
  },
  {
    field: 'totalAnomalies',
    name: (
      <EuiToolTip content="Total anomalies with a grade > 0 in last 24 hours">
        <span>
          Anomalies last 24 hours{' '}
          <EuiIcon
            size="s"
            color="subdued"
            type="questionInCircle"
            className="eui-alignTop"
          />
        </span>
      </EuiToolTip>
    ),
    sortable: false,
    dataType: 'number',
    align: 'right',
    width: '100px',
  },
  {
    field: 'lastActiveAnomaly',
    name: (
      <EuiToolTip content="Time of the last active anomaly with a grade > 0">
        <span>
          Last anomaly occurrence{' '}
          <EuiIcon
            size="s"
            color="subdued"
            type="questionInCircle"
            className="eui-alignTop"
          />
        </span>
      </EuiToolTip>
    ),
    sortable: false,
    dataType: 'date',
    width: '100px',
    align: 'left',
    render: renderTime,
  },
  {
    field: 'lastUpdated',
    name: (
      <EuiToolTip content="Time of the last detector update">
        <span>
          Last updated{' '}
          <EuiIcon
            size="s"
            color="subdued"
            type="questionInCircle"
            className="eui-alignTop"
          />
        </span>
      </EuiToolTip>
    ),
    sortable: false,
    dataType: 'date',
    width: '100px',
    align: 'left',
    render: renderLastUpdateTime,
  },
];
