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
  EuiFlexItem,
  EuiFlexGroup,
  EuiSpacer,
  EuiComboBox,
  EuiRadioGroup,
  EuiCallOut,
} from '@elastic/eui';
import { FormikProps } from 'formik';
import { debounce, get } from 'lodash';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../../../redux/reducers';
import {
  getDetectorList,
  getHistoricalDetectorList,
} from '../../../../../../redux/reducers/ad';
import { getMappings } from '../../../../../../redux/reducers/elasticsearch';
import { GET_ALL_DETECTORS_QUERY_PARAMS } from '../../../../../utils/constants';
import { searchDetector } from '../../../../../../redux/reducers/ad';
import { FormattedFormRow } from '../../../../../createDetector/components/FormattedFormRow/FormattedFormRow';
import { HistoricalDetectorFormikValues } from '../../../../utils/constants';
import { CREATE_HISTORICAL_DETECTOR_OPTIONS } from '../../../../utils/constants';
import { sanitizeSearchText } from '../../../../../utils/helpers';
import {
  populateDetectorFieldsFromDetector,
  populateDetectorFieldsToInitialValues,
  untouchDetectorFields,
} from './utils/helpers';
import { getAllDetectorOptions } from '../../../../utils/helpers';
import { GetDetectorsQueryParams } from '../../../../../../../server/models/types';

interface ExistingDetectorsProps {
  formikProps: FormikProps<HistoricalDetectorFormikValues>;
}

export function ExistingDetectors(props: ExistingDetectorsProps) {
  const dispatch = useDispatch();
  const selectedIndexOption = get(
    props,
    'formikProps.values.index.0.label',
    ''
  );
  const isIndexSelected = selectedIndexOption && selectedIndexOption.length > 0;
  const adState = useSelector((state: AppState) => state.ad);
  const detectors = adState.detectors;
  const allDetectors = {
    ...adState.detectorList,
    ...adState.historicalDetectorList,
  };
  const allDetectorOptions = isIndexSelected
    ? getAllDetectorOptions(Object.values(allDetectors))
    : [];
  const [queryText, setQueryText] = useState('');
  const [selectedDetectorId, setSelectedDetectorId] = useState<string>('');
  const selectedDetector = detectors[selectedDetectorId];
  const [createDetectorSelection, setCreateDetectorSelection] = useState<
    CREATE_HISTORICAL_DETECTOR_OPTIONS
  >(CREATE_HISTORICAL_DETECTOR_OPTIONS.CREATE_NEW);

  const existingDetectorsOptions = [
    {
      id: CREATE_HISTORICAL_DETECTOR_OPTIONS.CREATE_NEW,
      label: 'No',
    },
    {
      id: CREATE_HISTORICAL_DETECTOR_OPTIONS.USE_EXISTING,
      label: 'Yes',
    },
  ];

  const fetchAllDetectors = async (params: GetDetectorsQueryParams) => {
    dispatch(getDetectorList(params));
    dispatch(getHistoricalDetectorList(params));
  };

  // Fetch all realtime and historical detectors that are using the specified index
  useEffect(() => {
    if (isIndexSelected) {
      const params = {
        ...GET_ALL_DETECTORS_QUERY_PARAMS,
        indices: selectedIndexOption,
      };
      fetchAllDetectors(params);
    }
  }, [selectedIndexOption]);

  // Update the form if a change in selected detector, and get index mappings
  useEffect(() => {
    if (selectedDetector) {
      populateDetectorFieldsFromDetector(props.formikProps, selectedDetector);
      const indexName = selectedDetector.indices[0];
      dispatch(getMappings(indexName));
    } else {
      populateDetectorFieldsToInitialValues(props.formikProps);
    }
  }, [selectedDetector]);

  const getDetectorInfo = (detectorId: string) => {
    if (detectorId && allDetectors && allDetectors[detectorId]) {
      dispatch(
        searchDetector({
          query: { term: { 'name.keyword': allDetectors[detectorId].name } },
        })
      );
    }
  };

  const handleSearchChange = debounce(async (searchValue: string) => {
    if (searchValue !== queryText) {
      const sanitizedQuery = sanitizeSearchText(searchValue);
      setQueryText(sanitizedQuery);
      if (isIndexSelected) {
        const params = {
          ...GET_ALL_DETECTORS_QUERY_PARAMS,
          search: sanitizedQuery,
          indices: selectedIndexOption,
        };
        fetchAllDetectors(params);
      }
    }
  }, 300);

  const onSelectionChange = (id: string) => {
    setCreateDetectorSelection(id as CREATE_HISTORICAL_DETECTOR_OPTIONS);
    if (id === CREATE_HISTORICAL_DETECTOR_OPTIONS.CREATE_NEW) {
      setSelectedDetectorId('');
    }
    populateDetectorFieldsToInitialValues(props.formikProps);
    untouchDetectorFields(props.formikProps);
  };

  return (
    <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
      <EuiFlexGroup
        direction="row"
        gutterSize="none"
        justifyContent="spaceBetween"
        style={{ maxWidth: '400px' }}
      >
        <EuiFlexItem>
          <FormattedFormRow
            title="Configure using an existing detector"
            hint="Choose if you would like to source an existing real-time or historical detector to use as a template for your configuration."
          >
            <EuiRadioGroup
              name="use existing detectors radio group"
              options={existingDetectorsOptions}
              idSelected={createDetectorSelection}
              onChange={onSelectionChange}
            />
          </FormattedFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="l" />
      {createDetectorSelection ===
      CREATE_HISTORICAL_DETECTOR_OPTIONS.USE_EXISTING ? (
        <EuiFlexGroup direction="column">
          {!isIndexSelected ? (
            <EuiCallOut
              style={{ marginLeft: '12px' }}
              title="No index has been selected. Please select an index first."
              color="warning"
              iconType="alert"
              size="s"
            />
          ) : allDetectorOptions.length === 0 ? (
            <EuiCallOut
              style={{ marginLeft: '12px' }}
              title="No existing detectors are using the selected index."
              color="warning"
              iconType="alert"
              size="s"
            />
          ) : null}
          <EuiFlexItem style={{ maxWidth: '70%' }}>
            <FormattedFormRow
              fullWidth
              title="Source existing detector configuration"
              hint="Choose from an existing real-time or historical detector configuration"
            >
              <EuiComboBox
                id="existingDetectorsComboBox"
                placeholder="Existing detector configurations"
                async
                isLoading={adState.requesting}
                isDisabled={allDetectorOptions.length === 0}
                options={allDetectorOptions}
                onSearchChange={handleSearchChange}
                onBlur={() => {}}
                onChange={(options) => {
                  const detectorId = get(options, '0.id') as string;
                  setSelectedDetectorId(detectorId);
                  getDetectorInfo(detectorId);
                }}
                selectedOptions={
                  (selectedDetectorId &&
                    allDetectors &&
                    allDetectors[selectedDetectorId] && [
                      { label: allDetectors[selectedDetectorId].name },
                    ]) ||
                  []
                }
                singleSelection={true}
                isClearable={true}
              />
            </FormattedFormRow>
          </EuiFlexItem>
          <EuiSpacer />
        </EuiFlexGroup>
      ) : null}

      {createDetectorSelection ===
        CREATE_HISTORICAL_DETECTOR_OPTIONS.USE_EXISTING &&
      selectedDetector !== undefined ? (
        <EuiSpacer size="l" />
      ) : null}
    </EuiFlexGroup>
  );
}
