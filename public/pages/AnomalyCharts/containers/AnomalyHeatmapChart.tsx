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
import Plotly, { PlotData } from 'plotly.js-dist';
import plotComponentFactory from 'react-plotly.js/factory';
import { get, isEmpty, uniq } from 'lodash';
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
  getEntitytAnomaliesHeatmapData,
} from '../utils/anomalyChartUtils';
import { MIN_IN_MILLI_SECS } from '../../../../server/utils/constants';
import { EntityAnomalySummaries } from '../../../../server/models/interfaces';

interface AnomalyHeatmapChartProps {
  title: string;
  detectorId: string;
  detectorName: string;
  anomalies?: any[];
  dateRange: DateRange;
  isLoading: boolean;
  monitor?: Monitor;
  detectorInterval?: number;
  unit?: string;
  onHeatmapCellSelected(cell: HeatmapCell | undefined): void;
  onDisplayOptionChanged?(option: HeatmapDisplayOption | undefined): void;
  heatmapDisplayOption?: HeatmapDisplayOption;
  entityAnomalySummaries?: EntityAnomalySummaries[];
  isNotSample?: boolean;
}

export interface HeatmapCell {
  dateRange: DateRange;
  entityValue: string;
}

export interface HeatmapDisplayOption {
  sortType: AnomalyHeatmapSortType;
  entityOption: { label: string; value: number };
}

const COMBINED_OPTIONS = {
  label: 'Combined options',
  options: [
    { label: 'Top 10', value: 10 },
    { label: 'Top 20', value: 20 },
    { label: 'Top 30', value: 30 },
  ],
};

export const INITIAL_HEATMAP_DISPLAY_OPTION = {
  sortType: AnomalyHeatmapSortType.SEVERITY,
  entityOption: COMBINED_OPTIONS.options[0],
} as HeatmapDisplayOption;

export const AnomalyHeatmapChart = React.memo(
  (props: AnomalyHeatmapChartProps) => {
    const showLoader = useDelayedLoader(props.isLoading);
    const HEATMAP_ID = 'HEATMAP_DIV_ID';
    const CELL_HEIGHT = 40;

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

    const PlotComponent = plotComponentFactory(Plotly);

    const getViewEntityOptions = (inputHeatmapData: PlotData[]) => {
      let individualEntities = [];
      if (!isEmpty(inputHeatmapData)) {
        //@ts-ignore
        individualEntities = inputHeatmapData[0].y.filter(
          //@ts-ignore
          (entityValue) => entityValue && entityValue.trim().length > 0
        );
      }
      const individualEntityOptions = [] as any[];
      //@ts-ignore
      individualEntities.forEach((entityValue) => {
        individualEntityOptions.push({
          label: entityValue,
        });
      });

      return [
        getViewableCombinedOptions(
          COMBINED_OPTIONS,
          props.heatmapDisplayOption?.entityOption
        ),
        {
          label: 'Individual entities',
          options: individualEntityOptions.reverse(),
        },
      ];
    };

    const getViewableCombinedOptions = (
      existingOptions: any,
      selectedCombinedOption: any | undefined
    ) => {
      if (!selectedCombinedOption) {
        return existingOptions;
      }
      return {
        label: existingOptions.label,
        options: uniq([selectedCombinedOption, ...existingOptions.options]),
      };
    };

    const [originalHeatmapData, setOriginalHeatmapData] = useState(
      props.isNotSample
        ? // use anomaly summary data in case of realtime result
          getEntitytAnomaliesHeatmapData(
            props.dateRange,
            props.entityAnomalySummaries,
            props.heatmapDisplayOption.entityOption.value
          )
        : // use anomalies data in case of sample result
          getAnomaliesHeatmapData(
            props.anomalies,
            props.dateRange,
            AnomalyHeatmapSortType.SEVERITY,
            COMBINED_OPTIONS.options[0].value
          )
    );

    const [heatmapData, setHeatmapData] = useState<PlotData[]>(
      originalHeatmapData
    );

    const [sortByFieldValue, setSortByFieldValue] = useState<
      AnomalyHeatmapSortType
    >(
      props.isNotSample
        ? props.heatmapDisplayOption.sortType
        : SORT_BY_FIELD_OPTIONS[0].value
    );

    const [currentViewOptions, setCurrentViewOptions] = useState([
      getViewEntityOptions(originalHeatmapData)[0].options[0],
    ]);

    const [entityViewOptions, setEntityViewOptions] = useState(
      getViewEntityOptions(originalHeatmapData)
    );

    const [showAlertsFlyout, setShowAlertsFlyout] = useState<boolean>(false);

    const [numEntities, setNumEntities] = useState(
      originalHeatmapData[0].y.length
    );

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
          // in the case of re-clicking on selected cell
          const noCellSelectedHeatmapData = updateHeatmapPlotData(
            heatmapData[0],
            {
              opacity: 1,
            }
          );
          setHeatmapData([noCellSelectedHeatmapData]);
          props.onHeatmapCellSelected(undefined);
        } else {
          const transparentHeatmapData = updateHeatmapPlotData(heatmapData[0], {
            opacity: 0.3,
          });

          const selectedHeatmapData = getSelectedHeatmapCellPlotData(
            heatmapData[0],
            selectedCellIndices[1],
            selectedCellIndices[0]
          );
          setHeatmapData([transparentHeatmapData, ...selectedHeatmapData]);

          const selectedStartDate = moment(
            //@ts-ignore
            heatmapData[0].x[selectedCellIndices[1]],
            HEATMAP_X_AXIS_DATE_FORMAT
          ).valueOf();

          const selectedEndDate =
            selectedStartDate +
            get(selectedHeatmapData, '[0].cellTimeInterval', MIN_IN_MILLI_SECS);
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

        if (props.isNotSample && props.onDisplayOptionChanged) {
          props.onDisplayOptionChanged({
            sortType: sortByFieldValue,
            entityOption: COMBINED_OPTIONS.options[0],
          });
        } else {
          const displayTopEntityNum = get(COMBINED_OPTIONS.options[0], 'value');
          const updateHeatmapPlotData = getAnomaliesHeatmapData(
            props.anomalies,
            props.dateRange,
            sortByFieldValue,
            displayTopEntityNum
          );
          setOriginalHeatmapData(updateHeatmapPlotData);
          setHeatmapData(updateHeatmapPlotData);
          setNumEntities(updateHeatmapPlotData[0].y.length);
          setEntityViewOptions(getViewEntityOptions(updateHeatmapPlotData));
        }
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
          if (props.isNotSample && props.onDisplayOptionChanged) {
            props.onDisplayOptionChanged({
              sortType: sortByFieldValue,
              entityOption: option,
            });
          } else {
            const displayTopEntityNum = get(option, 'value');
            const updateHeatmapPlotData = getAnomaliesHeatmapData(
              props.anomalies,
              props.dateRange,
              sortByFieldValue,
              displayTopEntityNum
            );

            setOriginalHeatmapData(updateHeatmapPlotData);
            setHeatmapData(updateHeatmapPlotData);
            setNumEntities(updateHeatmapPlotData[0].y.length);
            setEntityViewOptions(getViewEntityOptions(updateHeatmapPlotData));
          }

          return;
        } else {
          nonCombinedOptions.push(option);
        }
      }
      // work on individual entities selected
      setCurrentViewOptions(nonCombinedOptions);

      setNumEntities(nonCombinedOptions.length);
      const selectedYs = nonCombinedOptions.map((option) =>
        get(option, 'label', '')
      );

      let selectedHeatmapData = filterHeatmapPlotDataByY(
        originalHeatmapData[0],
        selectedYs,
        sortByFieldValue
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
      setSortByFieldValue(value);
      props.onHeatmapCellSelected(undefined);
      if (
        props.isNotSample &&
        props.onDisplayOptionChanged &&
        currentViewOptions.length === 1 &&
        isCombinedViewEntityOption(currentViewOptions[0])
      ) {
        props.onDisplayOptionChanged({
          sortType: value,
          entityOption: currentViewOptions[0],
        });
        return;
      }
      const sortedHeatmapData = sortHeatmapPlotData(
        heatmapData[0],
        value,
        numEntities
      );
      const updatedHeatmapData = updateHeatmapPlotData(sortedHeatmapData, {
        opacity: 1,
      });
      setHeatmapData([updatedHeatmapData]);
    };

    return (
      <React.Fragment>
        <EuiFlexGroup style={{ padding: '5px' }}>
          <EuiFlexItem>
            <EuiCallOut
              size="s"
              title={
                hasAnomalyInHeatmap()
                  ? 'Choose a filled rectangle in the heat map for a more detailed view of anomalies within that entity.'
                  : 'No anomalies found in the specified date range.'
              }
              iconType={hasAnomalyInHeatmap() ? 'help' : 'iInCircle'}
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
                      options={entityViewOptions}
                      selectedOptions={currentViewOptions}
                      onChange={(selectedOptions) =>
                        handleViewEntityOptionsChange(selectedOptions)
                      }
                    />
                  </EuiFlexItem>
                  <EuiFlexItem style={{ minWidth: 150 }}>
                    <EuiSuperSelect
                      options={SORT_BY_FIELD_OPTIONS}
                      valueOfSelected={sortByFieldValue}
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
                <PlotComponent
                  data={heatmapData}
                  style={{
                    position: 'relative',
                  }}
                  layout={{
                    height: 50 + CELL_HEIGHT * numEntities,
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
