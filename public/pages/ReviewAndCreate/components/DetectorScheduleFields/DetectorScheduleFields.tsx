/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { EuiFlexGrid, EuiFlexItem, EuiButton, EuiText } from '@elastic/eui';
import React from 'react';
import moment from 'moment';
import { get } from 'lodash';
import { ConfigCell, FixedWidthRow } from '../../../../components/ConfigCell';
import { convertTimestampToNumber } from '../../../../utils/utils';
import { DetectorJobsFormikValues } from '../../../DetectorJobs/models/interfaces';

interface DetectorScheduleFieldsProps {
  onEditDetectorSchedule(): void;
  values: DetectorJobsFormikValues;
}

export const DetectorScheduleFields = (props: DetectorScheduleFieldsProps) => {
  const realTimeEnabled = get(props, 'values.realTime', true);
  const historicalEnabled = get(props, 'values.historical', false);
  const startTimeAsNumber = convertTimestampToNumber(
    get(props, 'values.startTime', 0)
  );
  const endTimeAsNumber = convertTimestampToNumber(
    get(props, 'values.endTime', 0)
  );

  const historicalRangeString =
    moment(startTimeAsNumber).format('MM/DD/YYYY') +
    ' - ' +
    moment(endTimeAsNumber).format('MM/DD/YYYY');

  return (
    <ContentPanel
      title="Detector schedule"
      titleSize="s"
      panelStyles={{ margin: '0px' }}
      actions={[
        <EuiButton
          data-test-subj="editScheduleButton"
          onClick={props.onEditDetectorSchedule}
        >
          Edit
        </EuiButton>,
      ]}
    >
      <EuiFlexGrid columns={4} gutterSize="l" style={{ border: 'none' }}>
        <EuiFlexItem>
          <ConfigCell
            title="Real-time detector"
            description={
              realTimeEnabled ? 'Start automatically' : `Start manually`
            }
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <FixedWidthRow label={'Historical analysis'}>
            {historicalEnabled ? (
              <EuiText>
                <p className="enabled">{'Enabled'}</p>
                <br />
                <p style={{ marginTop: '-44px' }} className="enabled">
                  {historicalRangeString}
                </p>
              </EuiText>
            ) : (
              <EuiText>
                <p className="enabled">{'Disabled'}</p>
              </EuiText>
            )}
          </FixedWidthRow>
        </EuiFlexItem>
      </EuiFlexGrid>
    </ContentPanel>
  );
};
