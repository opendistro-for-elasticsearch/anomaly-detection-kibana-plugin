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

import React from 'react';
import { get, isEmpty } from 'lodash';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiTitle,
  EuiSpacer,
  EuiCallOut,
} from '@elastic/eui';
import { FeatureChart } from '../components/FeatureChart/FeatureChart';
import {
  Detector,
  FeatureAttributes,
  Anomalies,
  DateRange,
  FEATURE_TYPE,
  EntityData,
} from '../../../models/interfaces';
import { NoFeaturePrompt } from '../components/FeatureChart/NoFeaturePrompt';
import { focusOnFeatureAccordion } from '../../EditFeatures/utils/helpers';
import moment from 'moment';
import { HeatmapCell } from './AnomalyHeatmapChart';
import { filterWithHeatmapFilter } from '../../utils/anomalyResultUtils';
import { getDateRangeWithSelectedHeatmapCell } from '../utils/anomalyChartUtils';

interface FeatureBreakDownProps {
  title?: string;
  detector: Detector;
  anomaliesResult: Anomalies;
  annotations: any[];
  isLoading: boolean;
  dateRange: DateRange;
  featureDataSeriesName: string;
  showFeatureMissingDataPointAnnotation?: boolean;
  rawAnomalyResults?: Anomalies;
  isFeatureDataMissing?: boolean;
  isHCDetector?: boolean;
  selectedHeatmapCell?: HeatmapCell;
}

export const FeatureBreakDown = React.memo((props: FeatureBreakDownProps) => {
  const getFeatureDataForChart = (
    anomaliesResult: Anomalies,
    featureId: string
  ) => {
    const originalFeatureData = get(
      anomaliesResult,
      `featureData.${featureId}`,
      []
    );
    if (props.isHCDetector) {
      if (props.selectedHeatmapCell) {
        const anomaliesFound = get(anomaliesResult, 'anomalies', []);
        const filteredFeatureData = [];
        for (let i = 0; i < anomaliesFound.length; i++) {
          const currentAnomalyData = anomaliesResult.anomalies[i];
          if (
            !isEmpty(get(currentAnomalyData, 'entity', [] as EntityData[])) &&
            get(currentAnomalyData, 'entity', [] as EntityData[])[0].value ===
              props.selectedHeatmapCell.entityValue &&
            get(currentAnomalyData, 'plotTime', 0) >=
              props.selectedHeatmapCell.dateRange.startDate &&
            get(currentAnomalyData, 'plotTime', 0) <=
              props.selectedHeatmapCell.dateRange.endDate
          ) {
            filteredFeatureData.push(originalFeatureData[i]);
          }
        }
        return filteredFeatureData;
      } else {
        return [];
      }
    } else {
      return originalFeatureData;
    }
  };
  const getAnnotationData = () => {
    if (props.isHCDetector) {
      if (props.selectedHeatmapCell) {
        return filterWithHeatmapFilter(
          props.annotations,
          props.selectedHeatmapCell,
          true,
          'coordinates.x0'
        );
      } else {
        return [];
      }
    } else {
      return props.annotations;
    }
  };

  return (
    <React.Fragment>
      {props.title ? (
        <EuiFlexGroup alignItems="flexEnd">
          <EuiFlexItem>
            <EuiTitle size="s" className="preview-title">
              <h4>{props.title}</h4>
            </EuiTitle>
            <EuiSpacer size="s" />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : null}
      {props.showFeatureMissingDataPointAnnotation &&
      props.detector.enabledTime &&
      props.isFeatureDataMissing ? (
        <EuiCallOut
          title={`Missing data is only shown since last enabled time: ${moment(
            props.detector.enabledTime
          ).format('MM/DD/YY h:mm A')}`}
          color={'warning'}
          iconType={'alert'}
          style={{ marginBottom: '20px' }}
        />
      ) : null}
      {get(props, 'detector.featureAttributes', []).map(
        (feature: FeatureAttributes, index: number) => (
          <React.Fragment key={`${feature.featureName}-${feature.featureId}`}>
            <FeatureChart
              feature={feature}
              featureData={
                //@ts-ignore
                getFeatureDataForChart(props.anomaliesResult, feature.featureId)
              }
              rawFeatureData={getFeatureDataForChart(
                //@ts-ignore
                props.rawAnomalyResults,
                feature.featureId
              )}
              annotations={getAnnotationData()}
              isLoading={props.isLoading}
              dateRange={getDateRangeWithSelectedHeatmapCell(
                props.dateRange,
                props.isHCDetector,
                props.selectedHeatmapCell
              )}
              featureType={
                get(
                  props,
                  `detector.uiMetadata.features.${feature.featureName}.featureType`
                ) as FEATURE_TYPE
              }
              field={
                get(
                  props,
                  `detector.uiMetadata.features.${feature.featureName}.featureType`
                ) === FEATURE_TYPE.SIMPLE
                  ? get(
                      props,
                      `detector.uiMetadata.features.${feature.featureName}.aggregationOf`
                    )
                  : undefined
              }
              aggregationMethod={
                get(
                  props,
                  `detector.uiMetadata.features.${feature.featureName}.featureType`
                ) === FEATURE_TYPE.SIMPLE
                  ? get(
                      props,
                      `detector.uiMetadata.features.${feature.featureName}.aggregationBy`
                    )
                  : undefined
              }
              featureDataSeriesName={props.featureDataSeriesName}
              edit={props.title === 'Sample feature breakdown'}
              onEdit={() => {
                focusOnFeatureAccordion(index);
              }}
              detectorInterval={props.detector.detectionInterval.period}
              showFeatureMissingDataPointAnnotation={
                props.showFeatureMissingDataPointAnnotation
              }
              detectorEnabledTime={props.detector.enabledTime}
              titlePrefix={
                props.selectedHeatmapCell
                  ? props.selectedHeatmapCell.entityValue
                  : undefined
              }
            />
            <EuiSpacer size="m" />
          </React.Fragment>
        )
      )}
      {!props.isLoading &&
      get(props, 'detector.featureAttributes.length', 0) === 0 ? (
        <NoFeaturePrompt detectorId={props.detector.id} />
      ) : null}
    </React.Fragment>
  );
});
