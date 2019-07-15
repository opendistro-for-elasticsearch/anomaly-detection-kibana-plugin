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
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { EuiFlexItem, EuiFlexGroup, EuiTitle, EuiSpacer } from '@elastic/eui';
import { DateRangePicker } from '../DateRangePicker';
import { Moment } from 'moment';
import {
  Chart,
  getAxisId,
  Axis,
  getSpecId,
  LineSeries,
  niceTimeFormatter,
  Settings,
  Position,
  RectAnnotation,
  getAnnotationId,
} from '@elastic/charts';
import { useDelayedLoader } from '../../../../hooks/useDelayedLoader';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';

interface AnomaliesChartProps {
  onDateRangeChange(startDate: Moment, endDate: Moment): void;
  anomalies: any[];
  annotations: any[];
  isLoading: boolean;
  startDateTime: Moment;
  endDateTime: Moment;
}
export const AnomaliesChart = React.memo((props: AnomaliesChartProps) => {
  const timeFormatter = niceTimeFormatter([
    props.startDateTime.valueOf(),
    props.endDateTime.valueOf(),
  ]);
  const showLoader = useDelayedLoader(props.isLoading);
  return (
    <React.Fragment>
      <EuiFlexGroup alignItems="flexEnd">
        <EuiFlexItem>
          <EuiTitle size="s" className="preview-title">
            <h4>Detector output</h4>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem>
          <DateRangePicker
            onRangeChange={props.onDateRangeChange}
            initialStartTime={props.startDateTime}
            initialEndTime={props.endDateTime}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <ContentPanel
        title="Total anomalies"
        titleSize="xs"
        titleClassName="preview-title"
      >
        <div
          style={{
            height: '300px',
            width: '100%',
            opacity: showLoader ? 0.2 : 1,
          }}
        >
          <Chart>
            <Settings
              showLegend
              legendPosition={Position.Bottom}
              showLegendDisplayValue={false}
            />
            <RectAnnotation
              dataValues={props.annotations || []}
              annotationId={getAnnotationId('react')}
              style={{
                stroke: darkModeEnabled() ? 'red' : '#FCAAAA',
                strokeWidth: 1,
                opacity: 0.8,
                fill: darkModeEnabled() ? 'red' : '#FCAAAA',
              }}
            />
            <Axis
              id={getAxisId('bottom')}
              position="bottom"
              tickFormat={timeFormatter}
            />
            <Axis
              id={getAxisId('left')}
              title={'Anomaly grade / confidence'}
              position="left"
              domain={{ min: 0, max: 1 }}
            />
            <LineSeries
              id={getSpecId('Anomaly grade')}
              xScaleType="time"
              yScaleType="linear"
              xAccessor={'plotTime'}
              yAccessors={['anomalyGrade']}
              data={props.anomalies}
            />
            <LineSeries
              id={getSpecId('Confidence')}
              xScaleType="time"
              yScaleType="linear"
              xAccessor={'plotTime'}
              yAccessors={['confidence']}
              data={props.anomalies}
            />
          </Chart>
        </div>
      </ContentPanel>
    </React.Fragment>
  );
});
