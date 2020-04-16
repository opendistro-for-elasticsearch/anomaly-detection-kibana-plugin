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
import React, { Fragment, useState, useEffect } from 'react';
import { AnomaliesLiveChart } from '../Components/AnomaliesLiveChart';
import { AnomaliesDistributionChart } from '../Components/AnomaliesDistribution';

import { useDispatch, useSelector } from 'react-redux';
import { get, isEmpty, cloneDeep } from 'lodash';

import { DetectorListItem } from '../../../models/interfaces';
import { getIndices, getAliases } from '../../../redux/reducers/elasticsearch';
import { getDetectorList } from '../../../redux/reducers/ad';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiComboBoxOptionProps,
  EuiSpacer,
} from '@elastic/eui';
import { AnomalousDetectorsList } from '../Components/AnomalousDetectorsList';
import {
  GET_ALL_DETECTORS_QUERY_PARAMS,
  ALL_DETECTORS_MESSAGE,
  ALL_DETECTOR_STATES_MESSAGE,
  ALL_INDICES_MESSAGE,
} from '../utils/constants';
import { AppState } from '../../../redux/reducers';
import { CatIndex, IndexAlias } from '../../../../server/models/types';
// import { getVisibleOptions } from '../../../pages/createDetector/containers/DataSource/utils/helpers';
import { getVisibleOptions } from '../../utils/helpers';
import {
  DETECTOR_STATE,
  PLUGIN_NAME,
  APP_PATH,
} from '../../../utils/constants';

export function DashboardOverview() {
  const dispatch = useDispatch();

  const allDetectorList = useSelector(
    (state: AppState) => state.ad.detectorList
  );

  const [currentDetectors, setCurrentDetectors] = useState(
    Object.values(allDetectorList)
  );

  const [allDetectorsSelected, setAllDetectorsSelected] = useState(true);

  const [selectedDetectorsName, setSelectedDetectorsName] = useState(
    [] as string[]
  );
  const getDetectorOptions = (detectorsIdMap: {
    [key: string]: DetectorListItem;
  }) => {
    const detectorNames = Object.values(detectorsIdMap).map(
      detectorListItem => {
        return detectorListItem.name;
      }
    );
    return detectorNames.map(buildItemOption);
  };

  const buildItemOption = (name: string) => {
    return {
      label: name,
    };
  };

  const handleDetectorsFilterChange = (
    options: EuiComboBoxOptionProps[]
  ): void => {
    const selectedNames = options.map(option => option.label);

    setSelectedDetectorsName(selectedNames);
    setAllDetectorsSelected(isEmpty(selectedNames));
  };

  const allDetectorStates = Object.values(DETECTOR_STATE);

  const [selectedDetectorStates, setSelectedDetectorStates] = useState(
    [] as string[]
  );
  // TODO: DetectorStates is placeholder for now until backend profile API is ready
  // Issue link: https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/issues/25
  const [allDetectorStatesSelected, setAllDetectorStatesSelected] = useState(
    true
  );

  const getDetectorStateOptions = (states: string[]) => {
    return states.map(state => {
      return { label: state };
    });
  };

  const handleDetectorStateFilterChange = (
    options: EuiComboBoxOptionProps[]
  ): void => {
    const selectedStates = options.map(option => option.label);
    setSelectedDetectorStates(selectedStates);
    setAllDetectorStatesSelected(isEmpty(selectedStates));
  };

  const elasticsearchState = useSelector(
    (state: AppState) => state.elasticsearch
  );

  const [selectedIndices, setSelectedIndices] = useState([] as string[]);
  const [allIndicesSelected, setAllIndicesSelected] = useState(true);

  const visibleIndices = get(elasticsearchState, 'indices', []) as CatIndex[];
  const visibleAliases = get(elasticsearchState, 'aliases', []) as IndexAlias[];

  const handleIndicesFilterChange = (
    options: EuiComboBoxOptionProps[]
  ): void => {
    const selectedIndices = options.map(option => option.label);
    setSelectedIndices(selectedIndices);
    setAllIndicesSelected(isEmpty(selectedIndices));
  };

  const filterSelectedDetectors = async (
    selectedNameList: string[],
    // TODO: DetectorStates is placeholder for now until backend profile API is ready
    // Issue link: https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/issues/25
    selectedStateList: string[],
    selectedIndexList: string[]
  ) => {
    let detectorsToFilter: DetectorListItem[];
    if (allDetectorsSelected) {
      detectorsToFilter = cloneDeep(Object.values(allDetectorList));
    } else {
      detectorsToFilter = cloneDeep(Object.values(allDetectorList)).filter(
        detectorItem => selectedNameList.includes(detectorItem.name)
      );
    }

    let filteredDetectorItemsByNamesAndIndex = detectorsToFilter;
    if (!allIndicesSelected) {
      filteredDetectorItemsByNamesAndIndex = detectorsToFilter.filter(
        detectorItem =>
          selectedIndexList.includes(detectorItem.indices.toString())
      );
    }

    setCurrentDetectors(filteredDetectorItemsByNamesAndIndex);
  };

  const intializeDetectors = () => {
    dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    dispatch(getIndices(''));
    dispatch(getAliases(''));
  };

  useEffect(() => {
    intializeDetectors();
  }, []);

  useEffect(() => {
    // this is needed because on Dashboard.tsx, getDetectorList API is called as 1s time, but it only gets 1 detector
    // and such result is rendered to this component since this component also relies on result from getDetectorList API.
    // And after this component does call getDetectorList to get all
    // detectors, we need to refresh the page with result from 2nd call
    // TODO: we need to implement namespacing for redux as per https://tiny.amazon.com/3eszqzpx/stacques4290
    // Issue link: https://github.com/opendistro-for-elasticsearch/anomaly-detection-kibana-plugin/issues/23
    setCurrentDetectors(Object.values(allDetectorList));
  }, [allDetectorList]);

  useEffect(() => {
    filterSelectedDetectors(
      selectedDetectorsName,
      selectedDetectorStates,
      selectedIndices
    );
  }, [selectedDetectorsName, selectedIndices, selectedDetectorStates]);

  return (
    <Fragment>
      <EuiFlexGroup justifyContent="flexEnd" style={{ padding: '0px 10px' }}>
        <EuiButton
          fill
          href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
          target="_blank"
          data-test-subj="add_detector"
        >
          Create detector
        </EuiButton>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexStart">
        <EuiFlexItem grow={1}>
          <EuiComboBox
            id="detectorFilter"
            placeholder={ALL_DETECTORS_MESSAGE}
            options={getDetectorOptions(allDetectorList)}
            onChange={handleDetectorsFilterChange}
            selectedOptions={selectedDetectorsName.map(buildItemOption)}
            isClearable={true}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={1}>
          <EuiComboBox
            id="detectorStateFilter"
            placeholder={ALL_DETECTOR_STATES_MESSAGE}
            options={getDetectorStateOptions(allDetectorStates)}
            onChange={handleDetectorStateFilterChange}
            selectedOptions={selectedDetectorStates.map(buildItemOption)}
            isClearable={true}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <EuiComboBox
            id="indicesFilter"
            placeholder={ALL_INDICES_MESSAGE}
            options={getVisibleOptions(visibleIndices, visibleAliases)}
            onChange={handleIndicesFilterChange}
            selectedOptions={selectedIndices.map(buildItemOption)}
            isClearable={true}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <AnomaliesLiveChart
        allDetectorsSelected={false}
        selectedDetectors={currentDetectors}
      />
      <EuiSpacer />
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={7}>
          <AnomaliesDistributionChart
            allDetectorsSelected={true}
            selectedDetectors={currentDetectors}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={2}>
          <AnomalousDetectorsList selectedDetectors={currentDetectors} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </Fragment>
  );
}
