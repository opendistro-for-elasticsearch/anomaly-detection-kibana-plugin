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

import React, { useState } from 'react';

import moment from 'moment';
import { PlotData } from 'plotly.js';
import Plot from 'react-plotly.js';
import { get, isEmpty } from 'lodash';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiLoadingChart,
  EuiText,
  EuiComboBox,
  EuiSuperSelect,
  EuiIconTip,
  EuiCallOut,
} from '@elastic/eui';
import { euiPaletteWarm } from '@elastic/eui/lib/services';
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import { Monitor, DateRange } from '../../../models/interfaces';
import { AlertsFlyout } from '../components/AlertsFlyout/AlertsFlyout';
import {
  getAnomaliesHeatmapData,
  getSelectedHeatmapCellPlotData,
  updateHeatmapPlotData,
  HEATMAP_X_AXIS_DATE_FORMAT,
  AnomalyHeatmapSortType,
  sortHeatmapPlotData,
  filterHeatmapPlotDataByY,
} from '../utils/anomalyChartUtils';

interface AnomalyHeatmapChartProps {
  title: string;
  detectorId: string;
  detectorName: string;
  anomalies: any[];
  dateRange: DateRange;
  isLoading: boolean;
  showAlerts?: boolean;
  monitor?: Monitor;
  detectorInterval?: number;
  unit?: string;
  onHeatmapCellSelected(cell: HeatmapCell | undefined): void;
}

export interface HeatmapCell {
  dateRange: DateRange;
  entityValue: string;
}

export const AnomalyHeatmapChart = React.memo(
  (props: AnomalyHeatmapChartProps) => {
    const showLoader = useDelayedLoader(props.isLoading);
    const HEATMAP_ID = 'HEATMAP_DIV_ID';
    const CELL_HEIGHT = 60;

    const SORT_BY_FIELD_OPTIONS = [
      {
        value: AnomalyHeatmapSortType.SEVERITY,
        inputDisplay: 'By severity',
      },
      {
        value: AnomalyHeatmapSortType.OCCURRENCES,
        inputDisplay: 'By occurrence',
      },
    ];

    const COMBINED_OPTIONS = {
      label: 'Combined options',
      options: [
        { label: 'Top 10', value: 10 },
        { label: 'Top 25', value: 25 },
        { label: 'Top 50', value: 50 },
      ],
    };

    const getViewEntityOptions = () => {
      let individualEntities = [];
      if (originalHeatmapData && !isEmpty(originalHeatmapData)) {
        //@ts-ignore
        individualEntities = originalHeatmapData[0].y.filter(
          //@ts-ignore
          (entityValue) => entityValue && entityValue.trim().length > 0
        );
      }
      console.log('individualEntities found', individualEntities);
      const individualEntityOptions = [] as any[];
      //@ts-ignore
      individualEntities.forEach((entityValue) => {
        individualEntityOptions.push({
          label: entityValue,
        });
      });
      console.log('individualEntityOptions found', individualEntityOptions);
      return [
        COMBINED_OPTIONS,
        {
          label: 'Individual entities',
          options: individualEntityOptions,
        },
      ];
    };

    const originalHeatmapData = getAnomaliesHeatmapData(
      props.anomalies,
      props.dateRange
    );
    const [heatmapData, setHeatmapData] = useState<PlotData[]>(
      originalHeatmapData
    );

    const [sortByFeildValue, setSortByFeildValue] = useState(
      SORT_BY_FIELD_OPTIONS[0].value
    );

    const [currentViewOptions, setCurrentViewOptions] = useState([
      getViewEntityOptions()[0].options[0],
    ]);

    const [showAlertsFlyout, setShowAlertsFlyout] = useState<boolean>(false);

    const [numEntities, setNumEntities] = useState(10);

    const hasAnomalyInHeatmap = (): boolean => {
      for (let entityAnomaliesOccurence of heatmapData[0].text) {
        //@ts-ignore
        const sum = entityAnomaliesOccurence.reduce((a, b) => {
          return a + b;
        });
        if (sum > 0) {
          return true;
        }
      }
      return false;
    };

    const handleHeatmapClick = (event: Plotly.PlotMouseEvent) => {
      const selectedCellIndices = get(event, 'points[0].pointIndex', []);
      const selectedEntity = get(event, 'points[0].y', '');
      if (!isEmpty(selectedCellIndices)) {
        let anomalyCount = get(event, 'points[0].text', 0);
        if (
          anomalyCount === 0 ||
          (heatmapData.length > 1 &&
            //@ts-ignore
            heatmapData[1].z[selectedCellIndices[0]][selectedCellIndices[1]] !=
              null)
        ) {
          const update = {
            opacity: 1,
          };
          const transparentHeatmapData = updateHeatmapPlotData(
            heatmapData[0],
            update
          );
          setHeatmapData([transparentHeatmapData]);
          props.onHeatmapCellSelected(undefined);
        } else {
          const update = {
            opacity: 0.3,
          };
          const transparentHeatmapData = updateHeatmapPlotData(
            heatmapData[0],
            update
          );

          const selectedHeatmapData = getSelectedHeatmapCellPlotData(
            heatmapData[0],
            selectedCellIndices[1],
            selectedCellIndices[0]
          );
          setHeatmapData([transparentHeatmapData, ...selectedHeatmapData]);

          const selectedEndDate = moment(
            //@ts-ignore
            heatmapData[0].x[selectedCellIndices[1]],
            HEATMAP_X_AXIS_DATE_FORMAT
          ).valueOf();

          const selectedStartDate =
            selectedEndDate -
            getHeatmapCellDateRangeInterval(
              //@ts-ignore
              heatmapData[0].x,
              selectedCellIndices[1]
            );
          props.onHeatmapCellSelected({
            dateRange: {
              startDate: selectedStartDate,
              endDate: selectedEndDate,
            },
            entityValue: selectedEntity,
          } as HeatmapCell);
        }
      }
    };

    const getHeatmapCellDateRangeInterval = (
      dates: string[],
      index: number
    ) => {
      if (dates.length < 2) {
        // if only less than 2 dates in X axis, it means the props.dateRange is too small.
        // we can just use props.dateRange interval for heatmap cell
        return props.dateRange.endDate - props.dateRange.startDate;
      }
      let prevIndex = index;
      let nextIndex = index + 1;
      if (nextIndex >= dates.length) {
        nextIndex = index;
        prevIndex = index - 1;
      }
      return (
        moment(dates[nextIndex], HEATMAP_X_AXIS_DATE_FORMAT).valueOf() -
        moment(dates[prevIndex], HEATMAP_X_AXIS_DATE_FORMAT).valueOf()
      );
    };

    const getColorPaletteFlexItem = (hexCode: string) => {
      return (
        <EuiFlexItem grow={false} style={{ margin: '0px' }}>
          <span
            style={{ backgroundColor: hexCode, width: '35px', height: '8px' }}
          />
        </EuiFlexItem>
      );
    };

    const handleViewEntityOptionsChange = (selectedViewOptions: any[]) => {
      props.onHeatmapCellSelected(undefined);
      if (isEmpty(selectedViewOptions)) {
        // when `clear` is hit for combo box
        setCurrentViewOptions([COMBINED_OPTIONS.options[0]]);
        const displayTopEntityNum = get(COMBINED_OPTIONS.options[0], 'value');
        setNumEntities(displayTopEntityNum);
        setHeatmapData(
          getAnomaliesHeatmapData(
            props.anomalies,
            props.dateRange,
            sortByFeildValue,
            displayTopEntityNum
          )
        );
        return;
      }
      const nonCombinedOptions = [] as any[];
      for (let option of selectedViewOptions) {
        if (currentViewOptions.includes(option)) {
          if (!isCombinedViewEntityOption(option)) {
            nonCombinedOptions.push(option);
          }
          continue;
        }
        if (isCombinedViewEntityOption(option)) {
          // only allow 1 combined option
          setCurrentViewOptions([option]);
          const displayTopEntityNum = get(option, 'value');
          setNumEntities(displayTopEntityNum);
          setHeatmapData(
            getAnomaliesHeatmapData(
              props.anomalies,
              props.dateRange,
              sortByFeildValue,
              displayTopEntityNum
            )
          );
          return;
        } else {
          nonCombinedOptions.push(option);
        }
      }
      setCurrentViewOptions(nonCombinedOptions);

      setNumEntities(nonCombinedOptions.length);
      const selectedYs = nonCombinedOptions.map((option) =>
        get(option, 'label', '')
      );

      let selectedHeatmapData = filterHeatmapPlotDataByY(
        originalHeatmapData[0],
        selectedYs,
        sortByFeildValue
      );
      selectedHeatmapData.opacity = 1;

      setHeatmapData([selectedHeatmapData]);
    };

    const isCombinedViewEntityOption = (inputOption: any) => {
      const combinedOptionsLabels = COMBINED_OPTIONS.options.map((option) =>
        get(option, 'label', '')
      );
      return combinedOptionsLabels.includes(get(inputOption, 'label', ''));
    };

    const handleSortByFieldChange = (value: any) => {
      setSortByFeildValue(value);
      const sortedHeatmapData = sortHeatmapPlotData(
        heatmapData[0],
        value,
        heatmapData[0].y.length
      );
      setHeatmapData([sortedHeatmapData]);
    };

    return (
      <React.Fragment>
        <EuiFlexGroup style={{ padding: '5px' }}>
          <EuiFlexItem>
            <EuiCallOut
              size="s"
              title={
                hasAnomalyInHeatmap()
                  ? 'Choose a filled rectangle in the heat map for a more detailed view of anomalies within that anomaly.'
                  : 'No anomalies found in the specified date range.'
              }
              iconType="help"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup style={{ padding: '0px' }}>
          <EuiFlexItem grow={false} style={{ minWidth: '80px' }}>
            <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
              <EuiText textAlign="right">
                <h4>{props.title}</h4>
              </EuiText>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem style={{ paddingLeft: '5px' }}>
            <EuiFlexGroup
              style={{ padding: '0px' }}
              justifyContent="spaceBetween"
            >
              <EuiFlexItem grow={false} style={{ marginLeft: '0px' }}>
                <EuiFlexGroup gutterSize="s" alignItems="center">
                  <EuiFlexItem style={{ minWidth: 300 }}>
                    <EuiComboBox
                      placeholder="Select options"
                      options={getViewEntityOptions()}
                      selectedOptions={currentViewOptions}
                      onChange={(selectedOptions) =>
                        handleViewEntityOptionsChange(selectedOptions)
                      }
                    />
                  </EuiFlexItem>
                  <EuiFlexItem style={{ minWidth: 150 }}>
                    <EuiSuperSelect
                      options={SORT_BY_FIELD_OPTIONS}
                      valueOfSelected={sortByFeildValue}
                      onChange={(value) => handleSortByFieldChange(value)}
                      hasDividers
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem>
                    <EuiFlexGroup
                      direction="column"
                      style={{ paddingRight: '15px' }}
                    >
                      <EuiFlexItem>
                        <EuiFlexItem style={{ margin: '0px', height: '20px' }}>
                          <EuiText size="xs" style={{ margin: '0px' }}>
                            Anomaly grade{' '}
                            <EuiIconTip
                              content="Indicates to what extent this data point is anomalous. The scale ranges from 0 to 1."
                              position="top"
                              type="iInCircle"
                            />
                          </EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem
                          style={{
                            margin: '0px',
                            height: '20px',
                            paddingLeft: '12px',
                          }}
                        >
                          <EuiFlexGroup alignItems="center">
                            {euiPaletteWarm(5).map((hexCode) => {
                              return getColorPaletteFlexItem(hexCode);
                            })}
                          </EuiFlexGroup>
                        </EuiFlexItem>
                        <EuiFlexItem
                          style={{
                            margin: '0px',
                            height: '20px',
                            paddingLeft: '12px',
                          }}
                        >
                          <EuiFlexGroup
                            alignItems="center"
                            justifyContent="spaceBetween"
                          >
                            <EuiFlexItem grow={false} style={{ margin: '0px' }}>
                              <EuiText size="xs">
                                <strong>0.0</strong> (None)
                              </EuiText>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false} style={{ margin: '0px' }}>
                              <EuiText size="xs">
                                (Critical) <strong>1.0</strong>
                              </EuiText>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiFlexItem>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup
          style={{ padding: '0px', paddingBottom: '0px' }}
          alignItems="flexEnd"
        >
          <EuiFlexItem>
            <div
              style={{
                width: '100%',
                opacity: showLoader ? 0.2 : 1,
              }}
            >
              {props.isLoading ? (
                <EuiFlexGroup
                  justifyContent="spaceAround"
                  style={{ paddingTop: '150px' }}
                >
                  <EuiFlexItem grow={false}>
                    <EuiLoadingChart size="xl" mono />
                  </EuiFlexItem>
                </EuiFlexGroup>
              ) : (
                <Plot
                  data={heatmapData}
                  style={{
                    position: 'relative',
                  }}
                  layout={{
                    height: numEntities === 1 ? 80 : CELL_HEIGHT * numEntities,
                    xaxis: {
                      showline: true,
                      nticks: 5,
                      showgrid: false,
                      ticklen: 11,
                      fixedrange: true,
                    },
                    yaxis: {
                      showline: true,
                      showgrid: false,
                      fixedrange: true,
                    },
                    margin: {
                      l: 100,
                      r: 0,
                      t: 0,
                      b: 50,
                      pad: 2,
                    },
                  }}
                  config={{
                    responsive: true,
                    displayModeBar: false,
                    scrollZoom: false,
                    displaylogo: false,
                  }}
                  onClick={handleHeatmapClick}
                  divId={HEATMAP_ID}
                />
              )}
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
        {showAlertsFlyout ? (
          <AlertsFlyout
            detectorId={props.detectorId}
            detectorName={props.detectorName}
            detectorInterval={get(props, 'detectorInterval', 1)}
            unit={get(props, 'unit', 'Minutes')}
            monitor={props.monitor}
            onClose={() => setShowAlertsFlyout(false)}
          />
        ) : null}
      </React.Fragment>
    );
  }
);
