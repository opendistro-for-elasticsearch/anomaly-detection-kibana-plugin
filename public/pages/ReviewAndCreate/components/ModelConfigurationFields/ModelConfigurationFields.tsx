/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { EuiBasicTable, EuiLink, EuiButton, EuiSpacer } from '@elastic/eui';
import {
  Detector,
  FEATURE_TYPE,
  FeatureAttributes,
} from '../../../../models/interfaces';
import { get, isEmpty, sortBy } from 'lodash';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { CodeModal } from '../../../../components/CodeModal/CodeModal';
import { AdditionalSettings } from '../AdditionalSettings/AdditionalSettings';
import { getTitleWithCount } from '../../../../utils/utils';
import { getShingleSizeFromObject } from '../../../ConfigureModel/utils/helpers';

interface ModelConfigurationFieldsProps {
  detector: Detector;
  onEditModelConfiguration(): void;
}

interface ModelConfigurationFieldsState {
  showCodeModel: boolean[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export const ModelConfigurationFields = (
  props: ModelConfigurationFieldsProps
) => {
  const [featuresState, setFeaturesState] = useState<
    ModelConfigurationFieldsState
  >({
    showCodeModel: get(props.detector, 'featureAttributes', []).map(
      () => false
    ),
    sortField: 'name',
    sortDirection: 'asc',
  });

  const closeModal = (index: number) => {
    const cloneShowCodeModal = [...featuresState.showCodeModel];
    cloneShowCodeModal[index] = false;
    setFeaturesState({
      ...featuresState,
      showCodeModel: cloneShowCodeModal,
    });
  };

  const showModal = (index: number) => {
    const cloneShowCodeModal = [...featuresState.showCodeModel];
    cloneShowCodeModal[index] = true;
    setFeaturesState({
      ...featuresState,
      showCodeModel: cloneShowCodeModal,
    });
  };

  const getModalVisibilityChange = (index: number) => {
    return featuresState.showCodeModel[index];
  };

  const handleTableChange = (props: any) => {
    setFeaturesState({
      ...featuresState,
      sortField: props.sort.field,
      sortDirection: props.sort.direction,
    });
  };

  const getSortedItems = (items: Array<any>) => {
    let sorted = sortBy(items, featuresState.sortField);
    if (featuresState.sortDirection == 'desc') {
      sorted = sorted.reverse();
    }
    return sorted;
  };
  const featureAttributes = get(props.detector, 'featureAttributes', []);
  const isHCDetector = !isEmpty(get(props.detector, 'categoryField', []));
  const shingleSize = getShingleSizeFromObject(props.detector, isHCDetector);

  const sorting = {
    sort: {
      field: featuresState.sortField,
      direction: featuresState.sortDirection,
    },
  };

  const items = featureAttributes.map(
    (feature: FeatureAttributes, index: number) => ({
      name: feature.featureName,
      definition: index,
      state: feature.featureEnabled ? 'Enabled' : 'Disabled',
    })
  );

  const sortedItems = getSortedItems(items);

  const columns = [
    {
      field: 'name',
      name: 'Feature name',
      sortable: true,
    },
    {
      field: 'definition',
      name: 'Feature definition',
      render: (featureIndex: number) => {
        const feature = featureAttributes[featureIndex];

        const metaData = get(
          props.detector,
          `uiMetadata.features.${feature.featureName}`,
          {}
        );

        if (
          Object.keys(metaData).length === 0 ||
          metaData.featureType == FEATURE_TYPE.CUSTOM
        ) {
          return (
            <div>
              <p>
                Custom expression:{' '}
                <EuiLink
                  data-test-subj={`viewFeature-${featureIndex}`}
                  onClick={() => showModal(featureIndex)}
                >
                  View code
                </EuiLink>
              </p>

              {!getModalVisibilityChange(featureIndex) ? null : (
                <CodeModal
                  code={JSON.stringify(feature.aggregationQuery, null, 4)}
                  title={feature.featureName}
                  subtitle="Custom expression"
                  closeModal={() => closeModal(featureIndex)}
                  getModalVisibilityChange={() =>
                    getModalVisibilityChange(featureIndex)
                  }
                />
              )}
            </div>
          );
        } else {
          return (
            <div>
              <p>Field: {metaData.aggregationOf || ''}</p>
              <p>Aggregation method: {metaData.aggregationBy || ''}</p>
            </div>
          );
        }
      },
    },
    {
      field: 'state',
      name: 'Feature state',
    },
  ];

  const getCellProps = () => {
    return {
      textOnly: true,
    };
  };

  const featureNum = Object.keys(featureAttributes).length;

  return (
    <ContentPanel
      title="Model configuration"
      titleSize="s"
      actions={[
        <EuiButton onClick={props.onEditModelConfiguration}>Edit</EuiButton>,
      ]}
    >
      <div>
        <AdditionalSettings
          shingleSize={shingleSize}
          categoryField={get(props, 'detector.categoryField', [])}
        />
        <EuiSpacer />
        <ContentPanel
          title={getTitleWithCount('Features', featureNum)}
          titleSize="s"
        >
          <EuiBasicTable
            items={sortedItems}
            columns={columns}
            cellProps={getCellProps}
            sorting={sorting}
            onChange={handleTableChange}
          />
        </ContentPanel>
      </div>
    </ContentPanel>
  );
};
