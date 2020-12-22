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
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiComboBoxOptionProps,
  EuiLoadingSpinner,
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
import { getVisibleOptions } from '../../utils/helpers';
import { BREADCRUMBS } from '../../../utils/constants';
import { DETECTOR_STATE } from '../../../../server/utils/constants';
import { getDetectorStateOptions } from '../../DetectorsList/utils/helpers';
import { DashboardHeader } from '../Components/utils/DashboardHeader';
import { EmptyDashboard } from '../Components/EmptyDashboard/EmptyDashboard';
import {
  prettifyErrorMessage,
  NO_PERMISSIONS_KEY_WORD,
} from '../../../../server/utils/helpers';
import { CoreServicesContext } from '../../../components/CoreServices/CoreServices';
import { CoreStart } from '../../../../../../src/core/public';

export function DashboardOverview() {
  const core = React.useContext(CoreServicesContext) as CoreStart;

  const dispatch = useDispatch();

  const adState = useSelector((state: AppState) => state.ad);

  const allDetectorList = adState.detectorList;

  const errorGettingDetectors = adState.errorMessage;

  const [isLoadingDetectors, setIsLoadingDetectors] = useState(true);

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
      (detectorListItem) => {
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
    const selectedNames = options.map((option) => option.label);

    setSelectedDetectorsName(selectedNames);
    setAllDetectorsSelected(isEmpty(selectedNames));
  };

  const [selectedDetectorStates, setSelectedDetectorStates] = useState(
    [] as DETECTOR_STATE[]
  );

  const [allDetectorStatesSelected, setAllDetectorStatesSelected] = useState(
    true
  );

  const handleDetectorStateFilterChange = (
    options: EuiComboBoxOptionProps[]
  ): void => {
    const selectedStates = options.map(
      (option) => option.label as DETECTOR_STATE
    );
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
    const selectedIndices = options.map((option) => option.label);
    setSelectedIndices(selectedIndices);
    setAllIndicesSelected(isEmpty(selectedIndices));
  };

  const filterSelectedDetectors = async (
    selectedNameList: string[],
    selectedStateList: DETECTOR_STATE[],
    selectedIndexList: string[]
  ) => {
    let detectorsToFilter: DetectorListItem[];
    if (allDetectorsSelected) {
      detectorsToFilter = cloneDeep(Object.values(allDetectorList));
    } else {
      detectorsToFilter = cloneDeep(
        Object.values(allDetectorList)
      ).filter((detectorItem) => selectedNameList.includes(detectorItem.name));
    }

    let filteredDetectorItemsByNamesAndIndex = detectorsToFilter;
    if (!allIndicesSelected) {
      filteredDetectorItemsByNamesAndIndex = detectorsToFilter.filter(
        (detectorItem) =>
          selectedIndexList.includes(detectorItem.indices.toString())
      );
    }

    let finalFilteredDetectors = filteredDetectorItemsByNamesAndIndex;
    if (!allDetectorStatesSelected) {
      finalFilteredDetectors = filteredDetectorItemsByNamesAndIndex.filter(
        (detectorItem) => selectedStateList.includes(detectorItem.curState)
      );
    }

    setCurrentDetectors(finalFilteredDetectors);
  };

  const intializeDetectors = async () => {
    setIsLoadingDetectors(true);
    dispatch(getDetectorList(GET_ALL_DETECTORS_QUERY_PARAMS));
    dispatch(getIndices(''));
    dispatch(getAliases(''));
  };

  useEffect(() => {
    intializeDetectors();
  }, []);

  useEffect(() => {
    if (errorGettingDetectors) {
      console.error(errorGettingDetectors);
      core.notifications.toasts.addDanger(
        typeof errorGettingDetectors === 'string' &&
          errorGettingDetectors.includes(NO_PERMISSIONS_KEY_WORD)
          ? prettifyErrorMessage(errorGettingDetectors)
          : 'Unable to get all detectors'
      );
      setIsLoadingDetectors(false);
    }
  }, [errorGettingDetectors]);

  useEffect(() => {
    core.chrome.setBreadcrumbs([
      BREADCRUMBS.ANOMALY_DETECTOR,
      BREADCRUMBS.DASHBOARD,
    ]);
  });

  useEffect(() => {
    setCurrentDetectors(Object.values(allDetectorList));
    setIsLoadingDetectors(false);
  }, [allDetectorList]);

  useEffect(() => {
    filterSelectedDetectors(
      selectedDetectorsName,
      selectedDetectorStates,
      selectedIndices
    );
  }, [selectedDetectorsName, selectedIndices, selectedDetectorStates]);

  return (
    <div style={{ height: '1200px' }}>
      <Fragment>
        <DashboardHeader hasDetectors={adState.totalDetectors > 0} />
        {isLoadingDetectors ? (
          <div>
            <EuiLoadingSpinner size="s" />
            &nbsp;&nbsp;
            <EuiLoadingSpinner size="m" />
            &nbsp;&nbsp;
            <EuiLoadingSpinner size="l" />
            &nbsp;&nbsp;
            <EuiLoadingSpinner size="xl" />
          </div>
        ) : adState.totalDetectors === 0 ? (
          <EmptyDashboard />
        ) : (
          <Fragment>
            <EuiFlexGroup justifyContent="flexStart" gutterSize="s">
              <EuiFlexItem>
                <EuiComboBox
                  id="detectorFilter"
                  data-test-subj="detectorFilter"
                  placeholder={ALL_DETECTORS_MESSAGE}
                  options={getDetectorOptions(allDetectorList)}
                  onChange={handleDetectorsFilterChange}
                  selectedOptions={selectedDetectorsName.map(buildItemOption)}
                  isClearable={true}
                  fullWidth
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiComboBox
                  id="detectorStateFilter"
                  data-test-subj="detectorStateFilter"
                  placeholder={ALL_DETECTOR_STATES_MESSAGE}
                  options={getDetectorStateOptions()}
                  onChange={handleDetectorStateFilterChange}
                  selectedOptions={selectedDetectorStates.map(buildItemOption)}
                  isClearable={true}
                  fullWidth
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiComboBox
                  id="indicesFilter"
                  data-test-subj="indicesFilter"
                  placeholder={ALL_INDICES_MESSAGE}
                  options={getVisibleOptions(visibleIndices, visibleAliases)}
                  onChange={handleIndicesFilterChange}
                  selectedOptions={selectedIndices.map(buildItemOption)}
                  isClearable={true}
                  fullWidth
                />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer />
            <AnomaliesLiveChart selectedDetectors={currentDetectors} />
            <EuiSpacer />
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={6}>
                <AnomaliesDistributionChart
                  selectedDetectors={currentDetectors}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={3}>
                <AnomalousDetectorsList selectedDetectors={currentDetectors} />
              </EuiFlexItem>
            </EuiFlexGroup>
          </Fragment>
        )}
      </Fragment>
    </div>
  );
}
