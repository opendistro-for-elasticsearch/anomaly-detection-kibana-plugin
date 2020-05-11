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
import { DetectorListItem } from '../../../models/interfaces';
import { useState, useEffect } from 'react';
import {
  fillOutColors,
  getAnomalyDistributionForDetectorsByTimeRange,
} from '../utils/utils';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  EuiSelect,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingChart,
  //@ts-ignore
  EuiStat,
} from '@elastic/eui';
import { Chart, Partition, PartitionLayout } from '@elastic/charts/dist/index';
import { useDispatch } from 'react-redux';
import { Datum } from '@elastic/charts/dist/utils/commons';
import React from 'react';
import { TIME_RANGE_OPTIONS } from '../../Dashboard/utils/constants';
import { get, isEmpty } from 'lodash';
import { searchES } from '../../../redux/reducers/elasticsearch';
import { AD_DOC_FIELDS } from '../../../../server/utils/constants';
export interface AnomaliesDistributionChartProps {
  selectedDetectors: DetectorListItem[];
}

export const AnomaliesDistributionChart = (
  props: AnomaliesDistributionChartProps
) => {
  const dispatch = useDispatch();

  const [anomalyDistribution, setAnomalyDistribution] = useState(
    [] as object[]
  );

  // TODO: try to find a better way of using redux,
  // which can leverage redux, and also get rid of issue with multiple redux on same page,
  // so that we don't need to manualy update loading status
  // Issue link: https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/issues/23
  const [anomalyResultsLoading, setAnomalyResultsLoading] = useState(true);
  const [finalDetectors, setFinalDetectors] = useState(
    [] as DetectorListItem[]
  );

  const [indicesNumber, setIndicesNumber] = useState(0);

  const [timeRange, setTimeRange] = useState(TIME_RANGE_OPTIONS[0].value);

  const getAnomalyResult = async (currentDetectors: DetectorListItem[]) => {
    setAnomalyResultsLoading(true);

    const distributionResult = await getAnomalyDistributionForDetectorsByTimeRange(
      searchES,
      props.selectedDetectors,
      timeRange,
      dispatch,
      0,
      false
    );
    setAnomalyDistribution(distributionResult);

    const resultDetectors = getFinalDetectors(
      distributionResult,
      props.selectedDetectors
    );
    setIndicesNumber(getFinalIndices(resultDetectors).size);
    setFinalDetectors(resultDetectors);
    setAnomalyResultsLoading(false);
  };

  const getFinalIndices = (detectorList: DetectorListItem[]) => {
    const indicesSet = new Set();
    detectorList.forEach(detectorItem => {
      indicesSet.add(detectorItem.indices.toString());
    });

    return indicesSet;
  };

  const getFinalDetectors = (
    finalAnomalyResult: object[],
    detectorList: DetectorListItem[]
  ): DetectorListItem[] => {
    const detectorSet = new Set<string>();
    finalAnomalyResult.forEach(anomalyResult => {
      detectorSet.add(get(anomalyResult, AD_DOC_FIELDS.DETECTOR_ID, ''));
    });

    const filteredDetectors = detectorList.filter(detector =>
      detectorSet.has(detector.id)
    );

    return filteredDetectors;
  };

  const handleOnChange = (e: any) => {
    setTimeRange(e.target.value);
  };

  useEffect(() => {
    getAnomalyResult(props.selectedDetectors);
  }, [timeRange, props.selectedDetectors]);

  return (
    <ContentPanel
      title="Anomalies by index and detector"
      titleSize="s"
      subTitle={
        <EuiFlexItem>
          <EuiText className={'anomaly-distribution-subtitle'}>
            <p>
              {'The inner circle shows the anomaly distribution by your indices. ' +
                'The outer circle shows the anomaly distribution by your detectors.'}
            </p>
          </EuiText>
        </EuiFlexItem>
      }
      actions={
        <EuiSelect
          style={{ width: 150 }}
          id="timeRangeSelect"
          options={TIME_RANGE_OPTIONS}
          value={timeRange}
          onChange={handleOnChange}
          fullWidth
        />
      }
    >
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiStat
            description={'Indices with anomalies'}
            title={indicesNumber}
            isLoading={anomalyResultsLoading}
            titleSize="s"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiStat
            description={'Detectors with anomalies'}
            title={finalDetectors.length}
            isLoading={anomalyResultsLoading}
            titleSize="s"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      {anomalyResultsLoading ? (
        <EuiFlexGroup justifyContent="center">
          <EuiFlexItem grow={false}>
            <EuiLoadingChart size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        <EuiFlexGroup justifyContent="center">
          <EuiFlexItem grow={false}>
            {isEmpty(anomalyDistribution) ? null : (
              <Chart className="anomalies-distribution-sunburst">
                <Partition
                  id="Anomalies by index and detector"
                  data={anomalyDistribution}
                  valueAccessor={(d: Datum) => d.count as number}
                  valueFormatter={(d: number) => d.toString()}
                  layers={[
                    {
                      groupByRollup: (d: Datum) => d.indices,
                      nodeLabel: (d: Datum) => {
                        return d;
                      },
                      fillLabel: {
                        textInvertible: true,
                      },
                      shape: {
                        fillColor: d => {
                          return fillOutColors(
                            d,
                            (d.x0 + d.x1) / 2 / (2 * Math.PI),
                            []
                          );
                        },
                      },
                    },
                    {
                      groupByRollup: (d: Datum) => d.name,
                      nodeLabel: (d: Datum) => {
                        return d;
                      },
                      fillLabel: {
                        textInvertible: true,
                      },
                      shape: {
                        fillColor: d => {
                          return fillOutColors(
                            d,
                            (d.x0 + d.x1) / 2 / (2 * Math.PI),
                            []
                          );
                        },
                      },
                    },
                  ]}
                  config={{
                    partitionLayout: PartitionLayout.sunburst,
                    fontFamily: 'Arial',
                    outerSizeRatio: 1,
                    fillLabel: {
                      textInvertible: true,
                    },
                    linkLabel: {
                      maxCount: 0,
                    },
                    // TODO: Given only 1 detector exists, the inside Index circle will have issue in following scenarios:
                    // 1: if Linked Label is configured for identifying index, label of Index circle will be invisible;
                    // 2: if Fill Label is configured for identifying index, label of it will be overlapped with outer Detector circle
                    // Issue link: https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/issues/24
                  }}
                />
              </Chart>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      )}
    </ContentPanel>
  );
};
