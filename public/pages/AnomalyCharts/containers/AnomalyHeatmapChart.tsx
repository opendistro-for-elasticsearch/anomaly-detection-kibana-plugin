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

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { DurationInputArg2 } from 'moment';
import moment from 'moment';
import { PlotData, restyle, deleteTraces, addTraces } from 'plotly.js';
import Plot from 'react-plotly.js';
import { cloneDeep, get, isEmpty } from 'lodash';
import dateMath from '@elastic/datemath';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiIcon,
  EuiLoadingChart,
  EuiStat,
  EuiSuperDatePicker,
  EuiText,
  EuiBadge,
  EuiComboBox,
  EuiSuperSelect,
  EuiIconTip,
} from '@elastic/eui';
import {
  Chart,
  Axis,
  LineSeries,
  niceTimeFormatter,
  Settings,
  Position,
  LineAnnotation,
  AnnotationDomainTypes,
  RectAnnotation,
  ScaleType,
  XYBrushArea,
} from '@elastic/charts';
import {
  euiPaletteComplimentary,
  euiPaletteForStatus,
  euiPaletteForTemperature,
  euiPaletteCool,
  euiPaletteWarm,
  euiPaletteNegative,
  euiPalettePositive,
  euiPaletteGray,
} from '@elastic/eui/lib/services';
import { useDelayedLoader } from '../../../hooks/useDelayedLoader';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  AnomalySummary,
  Monitor,
  Detector,
  DateRange,
  MonitorAlert,
} from '../../../models/interfaces';
import {
  prepareDataForChart,
  filterWithDateRange,
} from '../../utils/anomalyResultUtils';
import { AlertsFlyout } from '../components/AlertsFlyout/AlertsFlyout';

import { AlertsButton } from '../components/AlertsButton/AlertsButton';
import { darkModeEnabled } from '../../../utils/kibanaUtils';
import {
  AlertsStat,
  AnomalyStatWithTooltip,
} from '../components/AnomaliesStat/AnomalyStat';
import {
  INITIAL_ANOMALY_SUMMARY,
  CHART_FIELDS,
  DATE_PICKER_QUICK_OPTIONS,
  ANOMALY_CHART_THEME,
} from '../utils/constants';
import {
  convertAlerts,
  generateAlertAnnotations,
  getAnomalySummary,
  disabledHistoryAnnotations,
  getAlertsQuery,
  getAnomaliesHeatmapData,
  getSelectedHeatmapCellPlotData,
  updateHeatmapPlotData,
  HEATMAP_X_AXIS_DATE_FORMAT,
} from '../utils/anomalyChartUtils';
import { searchES } from '../../../redux/reducers/elasticsearch';
import { AnomalyDetailsChart } from '../containers/AnomalyDetailsChart';

interface AnomalyHeatmapChartProps {
  //   onZoomRangeChange(startDate: number, endDate: number): void;
  title: string;
  anomalies: any[];
  dateRange: DateRange;
  isLoading: boolean;
  showAlerts?: boolean;
  onHeatmapCellSelected(cell: HeatmapCell | undefined): void;
}

export interface HeatmapCell {
  dateRange: DateRange;
  xValue: any;
  yValue: any;
  zValue: any;
  xIndex: number;
  yIndex: number;
  categoryField: string;
  categoryValue: string;
}

export const AnomalyHeatmapChart = React.memo(
  (props: AnomalyHeatmapChartProps) => {
    const showLoader = useDelayedLoader(props.isLoading);
    const HEATMAP_ID = 'HEATMAP_DIV_ID';
    const CELL_HEIGHT = 60;

    const SORT_BY_FIELD_OPTIONS = [
      {
        value: 'severity',
        inputDisplay: 'By severity',
      },
      {
        value: 'occurrence',
        inputDisplay: 'By occurrence',
      },
    ];

    const COMBINED_OPTIONS = {
      label: 'Combined options',
      options: [
        { label: 'Top 10', value: 'top_10' },
        { label: 'Top 25', value: 'top_25' },
        { label: 'Top 50', value: 'top_50' },
      ],
    };
    const getViewEntityOptions = () => {
      return [
        COMBINED_OPTIONS,
        {
          label: 'Individual entities',
          options: [
            {
              label: 'value1',
              value: 'v1',
            },
            { label: 'value2', value: 'v2' },
            { label: 'value3', value: 'v3' },
            { label: 'value4', value: 'v4' },
            { label: 'value5', value: 'v5' },
          ],
        },
      ];
    };

    // const ANOMALY_HEATMAP_COLORSCALE = [
    //   [0, '#F2F2F2'],
    //   [0.2, '#F7E0B8'],
    //   [0.4, '#F2C596'],
    //   [0.6, '#ECA976'],
    //   [0.8, '#E78D5B'],
    //   [1, '#E8664C'],
    // ];

    // const getPlotData = () => {
    //   const xs = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6'];
    //   const entities = ['value1', 'value2', 'value3', 'value4', 'value5'];
    //   const zs = [];
    //   for (let i = 0; i < entities.length; i++) {
    //     const row = [];
    //     for (let j = 0; j < xs.length; j++) {
    //       row.push(Math.random());
    //     }
    //     zs.push(row);
    //   }
    //   const plotData = [
    //     {
    //       // x: plotTimes.map((timestamp) => moment(timestamp).format('MM-DD HH:mm')),
    //       x: xs,
    //       y: entities,
    //       z: zs,
    //       colorscale: ANOMALY_HEATMAP_COLORSCALE,
    //       type: 'heatmap',
    //       showscale: false,
    //       xgap: 2,
    //       ygap: 2,
    //       opacity: 1,
    //       hoverinfo: 'x+y+z',
    //     },
    //   ] as PlotData[];
    //   return plotData;
    // };

    const [anomalies, setAnomalies] = useState(props.anomalies);
    const [heatmapData, setHeatmapData] = useState<PlotData[]>(
      getAnomaliesHeatmapData(anomalies, props.dateRange)
    );

    const [sortByFeildValue, setSortByFeildValue] = useState(
      SORT_BY_FIELD_OPTIONS[0].value
    );

    const [currentViewOptions, setCurrentViewOptions] = useState([
      getViewEntityOptions()[0].options[0],
    ]);

    const [numEntities, setNumEntities] = useState(5);
    // useEffect(() => {
    //   setViewEntityOptions([
    //     {
    //       label: 'Individual entities',
    //       options: [
    //         { label: 'value1' },
    //         { label: 'value2' },
    //         { label: 'value3' },
    //         { label: 'value4' },
    //         { label: 'value5' },
    //       ],
    //     },
    //   ]);
    // }, []);

    const handleHeatmapClick = (event: Plotly.PlotMouseEvent) => {
      console.log('click event', event);
      const selectedCellIndices = get(event, 'points[0].pointIndex', []);
      console.log('selectedCellIndices', selectedCellIndices);
      const selectedEntity = get(event, 'points[0].y', '');
      if (!isEmpty(selectedCellIndices)) {
        if (
          heatmapData.length > 1 &&
          //@ts-ignore
          heatmapData[1].z[selectedCellIndices[0]][selectedCellIndices[1]] !=
            null
        ) {
          const update = {
            opacity: 1,
          };
          //   restyle(HEATMAP_ID, update, 0);
          const transparentHeatmapData = updateHeatmapPlotData(
            heatmapData[0],
            update
          );
          //   setHeatmapData([heatmapData[0]]);
          setHeatmapData([transparentHeatmapData]);
          props.onHeatmapCellSelected(undefined);
        } else {
          const update = {
            opacity: 0.3,
          };
          //   restyle(HEATMAP_ID, update, 0);
          const transparentHeatmapData = updateHeatmapPlotData(
            heatmapData[0],
            update
          );

          const selectedHeatmapData = getSelectedHeatmapCellPlotData(
            heatmapData[0],
            selectedCellIndices[1],
            selectedCellIndices[0]
          );
          //   if (heatmapData.length > 1) {
          //     deleteTraces(HEATMAP_ID, 1);
          //   }
          //   setSellectedCell({
          //     xIndex: selectedCellIndices[1],
          //     yIndex: selectedCellIndices[0],
          //   } as HeatmapCell);
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
            categoryValue: selectedEntity,
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
            style={{ backgroundColor: hexCode, width: '36px', height: '8px' }}
          />
        </EuiFlexItem>
      );
    };

    const handleViewEntityOptionsChange = (selectedViewOptions: any[]) => {
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
          setNumEntities(5);
          setHeatmapData(getAnomaliesHeatmapData(anomalies, props.dateRange));
          return;
        } else {
          nonCombinedOptions.push(option);
        }
      }
      setCurrentViewOptions(nonCombinedOptions);

      setNumEntities(nonCombinedOptions.length);
      let updatedHeatmapData = cloneDeep(heatmapData);
      updatedHeatmapData[0].y = nonCombinedOptions.map((option) =>
        get(option, 'label', '')
      );
      console.log('updatedHeatmapData', updatedHeatmapData);
      setHeatmapData(updatedHeatmapData);
    };

    // hack, to remove
    // useEffect(() => {
    //   for (let option of currentViewOptions) {
    //     if (isCombinedViewEntityOption(option)) {
    //       return;
    //     }
    //   }
    //   console.log('currentViewOptions when changed', currentViewOptions);
    //   let updatedHeatmapData = cloneDeep(heatmapData);
    //   updatedHeatmapData[0].y = currentViewOptions.map((option) =>
    //     get(option, 'label', '')
    //   );
    //   console.log('updatedHeatmapData', updatedHeatmapData);
    //   setHeatmapData(updatedHeatmapData);
    // }, [currentViewOptions]);

    const isCombinedViewEntityOption = (inputOption: any) => {
      const combinedOptionsLabels = COMBINED_OPTIONS.options.map((option) =>
        get(option, 'label', '')
      );
      return combinedOptionsLabels.includes(get(inputOption, 'label', ''));
    };

    const handleSortByFieldChange = (value: any) => {
      console.log('Sort by value', value);
      // setSortByFeildValue(value);
    };

    return (
      <React.Fragment>
        <EuiFlexGroup style={{ padding: '20px' }}>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center">
              <EuiText>
                <h4>{props.title}</h4>
              </EuiText>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup direction="column">
              <EuiFlexItem>
                <EuiFlexItem style={{ margin: '0px', height: '20px' }}>
                  <EuiText size="xs" style={{ margin: '0px' }}>
                    Anomaly grade{' '}
                    <EuiIconTip
                      content="Indicates to what extent this data poin is anomalous. The scale ranges from 0 to 1."
                      position="top"
                    />
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem
                  style={{ margin: '0px', height: '20px', paddingLeft: '12px' }}
                >
                  <EuiFlexGroup alignItems="center">
                    {euiPaletteWarm(5).map((hexCode) => {
                      return getColorPaletteFlexItem(hexCode);
                    })}
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem
                  style={{ margin: '0px', height: '20px', paddingLeft: '12px' }}
                >
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem grow={false} style={{ margin: '0px' }}>
                      <EuiText size="xs">0.0(None)</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem
                      grow={false}
                      style={{ width: '40px' }}
                    ></EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ margin: '0px' }}>
                      <EuiText size="xs">(Critical)1.0</EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup gutterSize="s" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText style={{ width: '40px' }} textAlign="center">
                  <strong>View</strong>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem style={{ minWidth: 300 }}>
                <EuiComboBox
                  placeholder="Select options"
                  options={getViewEntityOptions()}
                  // selectedOptions={[getViewEntityOptions()[0].options[0]]}
                  selectedOptions={currentViewOptions}
                  onChange={(selectedOptions) =>
                    handleViewEntityOptionsChange(selectedOptions)
                  }
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiSuperSelect
                  options={SORT_BY_FIELD_OPTIONS}
                  valueOfSelected={sortByFeildValue}
                  onChange={(value) => handleSortByFieldChange(value)}
                  hasDividers
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup style={{ padding: '20px', paddingTop: '0px' }}>
          <EuiFlexItem>
            <div
              style={{
                // height: '700px',
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
                  style={
                    {
                      // position: 'relative',
                      // display: 'inline-block',
                      // width: '1000px',
                      // height: '400px',
                      // minWidth: '800px',
                    }
                  }
                  layout={{
                    // width: 1000,
                    // height: 300,
                    height: CELL_HEIGHT * numEntities,
                    xaxis: {
                      showline: true,
                      nticks: 5,
                      showgrid: false,
                      ticklen: 11,
                    },
                    yaxis: {
                      showline: true,
                      showgrid: false,
                    },
                    margin: {
                      l: 80,
                      r: 0,
                      t: 0,
                      b: 40,
                      pad: 4,
                    },
                  }}
                  config={{
                    responsive: true,
                    displayModeBar: false,
                    scrollZoom: false,
                    displaylogo: false,
                  }}
                  onClick={(event: Plotly.PlotMouseEvent) => {
                    // setSellectedCell({
                    //   xIndex: 1,
                    //   yIndex: 2,
                    // } as HeatmapCell);
                    handleHeatmapClick(event);
                  }}
                  divId={HEATMAP_ID}
                />
              )}
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </React.Fragment>
    );
  }
);
