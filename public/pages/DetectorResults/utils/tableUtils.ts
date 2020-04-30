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

//@ts-ignore
import moment from 'moment';

export const DEFAULT_EMPTY_DATA = '-';

const renderTime = (time: number) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm A');
  return DEFAULT_EMPTY_DATA;
};

export const staticColumn = [
  {
    field: 'startTime',
    name: 'Start time',
    sortable: true,
    truncateText: false,
    render: renderTime,
    dataType: 'date',
  },
  {
    field: 'endTime',
    name: 'End time',
    sortable: true,
    truncateText: false,
    render: renderTime,
    dataType: 'date',
  },
  {
    field: 'confidence',
    name: 'Data confidence',
    sortable: true,
    truncateText: false,
    dataType: 'number',
  },
  {
    field: 'anomalyGrade',
    name: 'Anomaly grade',
    sortable: true,
    truncateText: false,
    dataType: 'number',
  },
];
