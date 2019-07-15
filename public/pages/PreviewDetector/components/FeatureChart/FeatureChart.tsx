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
  Chart,
  Axis,
  LineSeries,
  getSpecId,
  getAxisId,
  RectAnnotation,
  getAnnotationId,
  niceTimeFormatter,
  CustomSeriesColorsMap,
  DataSeriesColorsValues,
  Settings,
} from '@elastic/charts';
import { EuiButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { useDelayedLoader } from '../../../../hooks/useDelayedLoader';
import { Moment } from 'moment';
import { FeatureAggregationData } from 'public/models/interfaces';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';

interface FeatureChartProps {
  title: string;
  enabled: boolean;
  onEdit(ev: React.MouseEvent<HTMLButtonElement>): void;
  isEdit: boolean;
  featureData: FeatureAggregationData[];
  annotations: any[];
  isLoading: boolean;
  startDateTime: Moment;
  endDateTime: Moment;
}
const getDisabledChartBackground = () =>
  darkModeEnabled() ? '#25262E' : '#F0F0F0';
const getDisabledLineColor = () => (darkModeEnabled() ? '#434548' : '#C8CBCC');

export const FeatureChart = (props: FeatureChartProps) => {
  const timeFormatter = niceTimeFormatter([
    props.startDateTime.valueOf(),
    props.endDateTime.valueOf(),
  ]);
  const showLoader = useDelayedLoader(props.isLoading);
  const lineCustomSeriesColors: CustomSeriesColorsMap = new Map();
  const lineDataSeriesColorValues: DataSeriesColorsValues = {
    colorValues: [],
    specId: getSpecId('lines'),
  };
  lineCustomSeriesColors.set(
    lineDataSeriesColorValues,
    props.enabled ? '#007DBC' : getDisabledLineColor()
  );

  return (
    <ContentPanel
      title={props.enabled ? props.title : `${props.title} ( disabled )`}
      titleSize="xs"
      panelStyles={props.isEdit ? { border: '5px solid #96C8DA' } : {}}
      bodyStyles={
        !props.enabled ? { backgroundColor: getDisabledChartBackground() } : {}
      }
      actions={
        <EuiButton
          onClick={props.onEdit}
          disabled={props.isEdit}
          data-test-subj="editFeature"
        >
          Edit
        </EuiButton>
      }
      titleClassName="preview-title"
    >
      {props.featureData.length > 0 ? (
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
              legendPosition="bottom"
              showLegendDisplayValue={false}
            />
            {props.enabled ? (
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
            ) : null}
            <Axis id={getAxisId('left')} title={props.title} position="left" />
            <Axis
              id={getAxisId('bottom')}
              position="bottom"
              tickFormat={timeFormatter}
            />
            <LineSeries
              id={getSpecId('lines')}
              name={`Aggregated data for ${props.title}`}
              xScaleType="time"
              yScaleType="linear"
              xAccessor={'startTime'}
              yAccessors={['data']}
              customSeriesColors={lineCustomSeriesColors}
              data={props.featureData}
            />
          </Chart>
        </div>
      ) : (
        <EuiEmptyPrompt
          style={{ maxWidth: '45em' }}
          body={
            <EuiText>
              <p>{`There is no data to display for feature ${props.title}`}</p>
            </EuiText>
          }
        />
      )}
    </ContentPanel>
  );
};
