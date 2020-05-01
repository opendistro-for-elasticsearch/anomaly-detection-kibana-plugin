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
  Chart,
  Axis,
  LineSeries,
  RectAnnotation,
  niceTimeFormatter,
  Position,
  Settings,
  ScaleType,
} from '@elastic/charts';
import { EuiEmptyPrompt, EuiText, EuiLink, EuiButton } from '@elastic/eui';
import React, { useState, Fragment } from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { useDelayedLoader } from '../../../../hooks/useDelayedLoader';
import {
  FeatureAggregationData,
  FeatureAttributes,
  DateRange,
  FEATURE_TYPE,
} from '../../../../models/interfaces';
import { darkModeEnabled } from '../../../../utils/kibanaUtils';
import { prepareDataForChart } from '../../../utils/anomalyResultUtils';
import { CodeModal } from '../../../DetectorConfig/components/CodeModal/CodeModal';
import {
  CHART_FIELDS,
  FEATURE_CHART_THEME,
} from '../../utils/constants';

interface FeatureChartProps {
  feature: FeatureAttributes;
  featureData: FeatureAggregationData[];
  annotations: any[];
  isLoading: boolean;
  dateRange: DateRange;
  featureType: FEATURE_TYPE;
  field?: string;
  aggregationMethod?: string;
  aggregationQuery?: string;
  featureDataSeriesName: string;
  edit?: boolean;
  onEdit?(): void;
}
const getDisabledChartBackground = () =>
  darkModeEnabled() ? '#25262E' : '#F0F0F0';

export const FeatureChart = (props: FeatureChartProps) => {
  const [showCustomExpression, setShowCustomExpression] = useState<boolean>(
    false
  );
  const timeFormatter = niceTimeFormatter([
    props.dateRange.startDate,
    props.dateRange.endDate,
  ]);
  const showLoader = useDelayedLoader(props.isLoading);

  const featureDescription = () => (
    <EuiText size="s">
      {props.featureType === FEATURE_TYPE.SIMPLE ? (
        <Fragment>
          <span
            className="content-panel-subTitle"
            style={{ paddingRight: '20px' }}
          >
            Field: {props.field}
          </span>
          <span
            className="content-panel-subTitle"
            style={{ paddingRight: '20px' }}
          >
            Aggregation method: {props.aggregationMethod}
          </span>
          <span className="content-panel-subTitle">
            State: {props.feature.featureEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </Fragment>
      ) : (
        <Fragment>
          <span
            className="content-panel-subTitle"
            style={{ paddingRight: '20px' }}
          >
            Custom expression:{' '}
            <EuiLink onClick={() => setShowCustomExpression(true)}>
              View code
            </EuiLink>
          </span>
          <span className="content-panel-subTitle">
            State: {props.feature.featureEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </Fragment>
      )}
    </EuiText>
  );

  const featureData = prepareDataForChart(props.featureData, props.dateRange);
  return (
    <ContentPanel
      title={
        props.feature.featureEnabled
          ? props.feature.featureName
          : `${props.feature.featureName} (disabled)`
      }
      bodyStyles={
        !props.feature.featureEnabled
          ? { backgroundColor: getDisabledChartBackground() }
          : {}
      }
      subTitle={featureDescription()}
      actions={
        props.edit ? <EuiButton onClick={props.onEdit}>Edit</EuiButton> : null
      }
    >
      {props.featureData.length > 0 ? (
        <div
          style={{
            height: '200px',
            width: '100%',
            opacity: showLoader ? 0.2 : 1,
          }}
        >
          <Chart>
            <Settings
              showLegend
              showLegendExtra={false}
              showLegendDisplayValue={false}
              legendPosition={Position.Right}
              theme={FEATURE_CHART_THEME}
            />
            {props.feature.featureEnabled ? (
              <RectAnnotation
                dataValues={props.annotations || []}
                id="annotations"
                style={{
                  stroke: darkModeEnabled() ? 'red' : '#D5DBDB',
                  strokeWidth: 1,
                  opacity: 0.8,
                  fill: darkModeEnabled() ? 'red' : '#D5DBDB',
                }}
              />
            ) : null}
            <Axis
              id="left"
              title={props.featureDataSeriesName}
              position="left"
              showGridLines
            />
            <Axis id="bottom" position="bottom" tickFormat={timeFormatter} />
            <LineSeries
              id="featureData"
              name={props.featureDataSeriesName}
              xScaleType={ScaleType.Time}
              yScaleType={ScaleType.Linear}
              xAccessor={CHART_FIELDS.PLOT_TIME}
              yAccessors={[CHART_FIELDS.DATA]}
              data={featureData}
            />
          </Chart>
          {showCustomExpression ? (
            <CodeModal
              title={props.feature.featureName}
              subtitle="Custom expression"
              code={JSON.stringify(props.feature.aggregationQuery, null, 4)}
              getModalVisibilityChange={() => true}
              closeModal={() => setShowCustomExpression(false)}
            />
          ) : null}
        </div>
      ) : (
        <EuiEmptyPrompt
          style={{ maxWidth: '45em' }}
          body={
            <EuiText>
              <p>{`There is no data to display for feature ${props.feature.featureName}`}</p>
            </EuiText>
          }
        />
      )}
    </ContentPanel>
  );
};
