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
import { isEmpty } from 'lodash';
import { EuiDataGrid } from '@elastic/eui';
import { CatIndex } from '../../../../server/models/types';
import { Detector, DetectorListItem } from '../../../models/interfaces';
import { ANOMALY_DETECTORS_INDEX } from '../../../utils/constants';
import { SAMPLE_TYPE } from '../../../../server/utils/constants';
import {
  sampleHttpResponses,
  sampleEcommerce,
  sampleHostHealth,
} from '../utils/constants';

export const containsDetectorsIndex = (indices: CatIndex[]) => {
  if (isEmpty(indices)) {
    return false;
  }
  return indices.map((index) => index.index).includes(ANOMALY_DETECTORS_INDEX);
};

export const containsSampleIndex = (
  indices: CatIndex[],
  sampleType: SAMPLE_TYPE
) => {
  let indexName = '';
  switch (sampleType) {
    case SAMPLE_TYPE.HTTP_RESPONSES: {
      indexName = sampleHttpResponses.indexName;
      break;
    }
    case SAMPLE_TYPE.ECOMMERCE: {
      indexName = sampleEcommerce.indexName;
      break;
    }
    case SAMPLE_TYPE.HOST_HEALTH: {
      indexName = sampleHostHealth.indexName;
      break;
    }
  }
  return indices.map((index) => index.index).includes(indexName);
};

export const containsSampleDetector = (
  detectors: DetectorListItem[],
  sampleType: SAMPLE_TYPE
) => {
  let detectorName = '';
  switch (sampleType) {
    case SAMPLE_TYPE.HTTP_RESPONSES: {
      detectorName = sampleHttpResponses.detectorName;
      break;
    }
    case SAMPLE_TYPE.ECOMMERCE: {
      detectorName = sampleEcommerce.detectorName;
      break;
    }
    case SAMPLE_TYPE.HOST_HEALTH: {
      detectorName = sampleHostHealth.detectorName;
      break;
    }
  }
  return detectors.map((detector) => detector.name).includes(detectorName);
};

export const detectorIsSample = (detector: Detector) => {
  return (
    detector.name === sampleHttpResponses.detectorName ||
    detector.name === sampleEcommerce.detectorName ||
    detector.name === sampleHostHealth.detectorName
  );
};

export const getAssociatedIndex = (detector: Detector) => {
  if (detector.name === sampleHttpResponses.detectorName) {
    return sampleHttpResponses.indexName;
  }
  if (detector.name === sampleEcommerce.detectorName) {
    return sampleEcommerce.indexName;
  }
  if (detector.name === sampleHostHealth.detectorName) {
    return sampleHostHealth.indexName;
  }
  console.error(
    'Error getting associated sample index for detector ',
    detector.name
  );
  return '';
};

export const getDetectorId = (
  detectors: DetectorListItem[],
  detectorName: string
) => {
  let detectorId = '';
  detectors.some((detector) => {
    if (detector.name === detectorName) {
      detectorId = detector.id;
      return true;
    }
    return false;
  });
  return detectorId;
};

const getFieldsAndTypesData = (fields: string[], types: string[]) => {
  let data = [];
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const type = types[i];
    data.push({
      Field: field,
      Type: type,
    });
  }
  return data;
};

const getFeaturesAndAggsAndFieldsData = (
  features: string[],
  aggs: string[],
  fields: string[]
) => {
  let data = [];
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    const agg = aggs[i];
    const field = fields[i];
    data.push({
      Feature: feature,
      Aggregation: agg,
      'Index field': field,
    });
  }
  return data;
};

export const getFieldsAndTypesGrid = (fields: string[], types: string[]) => {
  const gridData = getFieldsAndTypesData(fields, types);
  return (
    <EuiDataGrid
      aria-label="Index fields and types"
      columns={[
        {
          id: 'Field',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
        {
          id: 'Type',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
      ]}
      columnVisibility={{
        visibleColumns: ['Field', 'Type'],
        setVisibleColumns: () => {},
      }}
      rowCount={gridData.length}
      renderCellValue={({ rowIndex, columnId }) =>
        //@ts-ignore
        gridData[rowIndex][columnId]
      }
      gridStyle={{
        border: 'horizontal',
        header: 'shade',
        rowHover: 'highlight',
        stripes: true,
      }}
      toolbarVisibility={false}
    />
  );
};

export const getFeaturesAndAggsAndFieldsGrid = (
  features: string[],
  aggs: string[],
  fields: string[]
) => {
  const gridData = getFeaturesAndAggsAndFieldsData(features, aggs, fields);
  return (
    <EuiDataGrid
      aria-label="Feature details"
      columns={[
        {
          id: 'Feature',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
        {
          id: 'Aggregation',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
        {
          id: 'Index field',
          isResizable: false,
          isExpandable: false,
          isSortable: false,
        },
      ]}
      columnVisibility={{
        visibleColumns: ['Feature', 'Aggregation', 'Index field'],
        setVisibleColumns: () => {},
      }}
      rowCount={gridData.length}
      renderCellValue={({ rowIndex, columnId }) =>
        //@ts-ignore
        gridData[rowIndex][columnId]
      }
      gridStyle={{
        border: 'horizontal',
        header: 'shade',
        rowHover: 'highlight',
        stripes: true,
      }}
      toolbarVisibility={false}
    />
  );
};
