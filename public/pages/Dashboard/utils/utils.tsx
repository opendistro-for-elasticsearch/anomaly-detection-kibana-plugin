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
import { EuiLink } from '@elastic/eui';
import {
  AD_DOC_FIELDS,
  SORT_DIRECTION,
  MIN_IN_MILLI_SECS,
} from '../../../../server/utils/constants';
import {
  Detector,
  FeatureAttributes,
  DetectorListItem,
} from '../../../models/interfaces';
import {
  PLUGIN_NAME,
  ANOMALY_RESULT_INDEX,
  MAX_ANOMALIES,
} from '../../../utils/constants';
import { get, orderBy, isEmpty } from 'lodash';
import { APIAction } from 'public/redux/middleware/types';
import { Dispatch } from 'redux';
import { EuiBasicTableColumn } from '@elastic/eui';
import { SHOW_DECIMAL_NUMBER_THRESHOLD } from './constants';
import { MAX_DETECTORS } from '../../../pages/utils/constants';

/**
 * Get the recent anomaly result query for the last timeRange period(Date-Math)
 * Given timeRange is 24h, it return a query which is used to get anomaly result
 * within last 24 hours.
 * This query can be only used for getAnomalyResults API in ad.ts file
 * @param  {[string]} timeRange [last time period which query is for]
 * @returns query which is used to get anomaly result for the last timeRange period
 */
export const buildGetRecentAnomalyResultQuery = (timeRange: string) => {
  return {
    range: {
      [AD_DOC_FIELDS.DATA_START_TIME]: {
        gte: 'now-' + timeRange,
      },
    },
    size: 30,
    sortField: AD_DOC_FIELDS.DATA_START_TIME,
    from: 0,
    sortDirection: SORT_DIRECTION.DESC,
  };
};

export type RgbColor = [number, number, number, number?];
export const rgbColors: RgbColor[] = [
  [46, 34, 235],
  [49, 32, 237],
  [52, 30, 238],
  [56, 29, 239],
  [59, 28, 240],
  [63, 27, 241],
  [66, 27, 242],
  [70, 27, 242],
  [73, 27, 243],
  [77, 28, 244],
  [80, 29, 244],
  [84, 30, 245],
  [87, 31, 245],
  [91, 32, 246],
  [94, 33, 246],
  [97, 35, 246],
  [100, 36, 247],
  [103, 38, 247],
  [106, 39, 248],
  [109, 41, 248],
  [112, 42, 248],
  [115, 44, 249],
  [118, 45, 249],
  [121, 47, 249],
  [123, 48, 250],
  [126, 49, 250],
  [129, 51, 250],
  [132, 52, 251],
  [135, 53, 251],
  [137, 54, 251],
  [140, 56, 251],
  [143, 57, 251],
  [146, 58, 252],
  [149, 59, 252],
  [152, 60, 252],
  [155, 60, 252],
  [158, 61, 252],
  [162, 62, 252],
  [165, 63, 252],
  [168, 63, 252],
  [171, 64, 252],
  [175, 65, 252],
  [178, 65, 252],
  [181, 66, 252],
  [185, 66, 252],
  [188, 66, 252],
  [191, 67, 252],
  [195, 67, 252],
  [198, 68, 252],
  [201, 68, 251],
  [204, 69, 251],
  [207, 69, 251],
  [211, 70, 251],
  [214, 70, 251],
  [217, 71, 250],
  [219, 72, 250],
  [222, 73, 250],
  [225, 74, 249],
  [227, 75, 249],
  [230, 76, 248],
  [232, 78, 247],
  [234, 79, 246],
  [236, 81, 245],
  [238, 83, 244],
  [240, 85, 243],
  [242, 88, 241],
  [243, 90, 240],
  [244, 93, 238],
  [245, 96, 236],
  [246, 99, 234],
  [247, 102, 232],
  [248, 105, 230],
  [249, 108, 227],
  [249, 111, 225],
  [250, 114, 223],
  [250, 117, 220],
  [251, 120, 217],
  [251, 123, 215],
  [252, 127, 212],
  [252, 130, 210],
  [252, 133, 207],
  [252, 136, 204],
  [252, 139, 201],
  [253, 141, 199],
  [253, 144, 196],
  [253, 147, 193],
  [253, 150, 190],
  [253, 153, 188],
  [253, 156, 185],
  [253, 158, 182],
  [253, 161, 179],
  [253, 164, 177],
  [253, 166, 174],
  [253, 169, 171],
  [253, 171, 168],
  [253, 174, 165],
  [252, 176, 162],
  [252, 179, 160],
  [252, 181, 157],
  [252, 184, 154],
  [252, 186, 151],
  [253, 188, 148],
  [253, 191, 145],
  [253, 193, 142],
  [253, 195, 139],
  [253, 198, 136],
  [253, 200, 133],
  [253, 202, 130],
  [253, 204, 127],
  [253, 207, 124],
  [253, 209, 120],
  [253, 211, 117],
  [253, 213, 114],
  [253, 215, 110],
  [253, 217, 107],
  [253, 219, 104],
  [253, 221, 100],
  [252, 223, 96],
  [252, 225, 93],
  [252, 227, 89],
  [251, 229, 85],
  [250, 231, 81],
  [250, 232, 77],
  [249, 234, 73],
  [248, 235, 69],
  [246, 236, 65],
  [245, 237, 61],
  [243, 238, 57],
  [242, 239, 54],
  [240, 239, 50],
  [238, 239, 46],
  [235, 239, 43],
  [233, 239, 40],
  [231, 239, 37],
  [228, 239, 35],
  [225, 238, 33],
  [223, 238, 31],
  [220, 237, 29],
  [217, 236, 27],
  [214, 235, 26],
  [211, 234, 25],
  [209, 233, 24],
  [206, 232, 24],
  [203, 231, 23],
  [200, 230, 22],
  [197, 229, 22],
  [194, 228, 21],
  [191, 227, 21],
  [188, 226, 21],
  [185, 225, 20],
  [182, 224, 20],
  [179, 223, 20],
  [176, 221, 19],
  [173, 220, 19],
  [170, 219, 19],
  [167, 218, 18],
  [164, 217, 18],
  [161, 216, 17],
  [158, 215, 17],
  [154, 214, 17],
  [151, 213, 16],
  [148, 211, 16],
  [145, 210, 16],
  [142, 209, 15],
  [139, 208, 15],
  [136, 207, 15],
  [132, 206, 14],
  [129, 205, 14],
  [126, 204, 14],
  [122, 202, 13],
  [119, 201, 13],
  [116, 200, 13],
  [112, 199, 13],
  [109, 198, 12],
  [105, 197, 12],
  [102, 196, 12],
  [98, 194, 12],
  [94, 193, 12],
  [91, 192, 12],
  [87, 191, 12],
  [83, 190, 13],
  [79, 188, 14],
  [76, 187, 15],
  [72, 186, 16],
  [68, 185, 18],
  [65, 183, 20],
  [62, 182, 22],
  [59, 181, 25],
  [56, 179, 27],
  [54, 178, 30],
  [52, 176, 34],
  [51, 175, 37],
  [50, 173, 40],
  [50, 172, 44],
  [50, 170, 48],
  [51, 168, 51],
  [52, 167, 55],
  [53, 165, 59],
  [54, 163, 63],
  [56, 161, 67],
  [57, 160, 71],
  [59, 158, 74],
  [60, 156, 78],
  [62, 154, 82],
  [63, 152, 86],
  [64, 150, 90],
  [66, 148, 93],
  [67, 147, 97],
  [67, 145, 101],
  [68, 143, 104],
  [69, 141, 108],
  [69, 139, 111],
  [69, 137, 115],
  [70, 135, 118],
  [70, 133, 122],
  [69, 131, 125],
  [69, 129, 129],
  [69, 128, 132],
  [68, 126, 135],
  [67, 124, 139],
  [67, 122, 142],
  [66, 120, 145],
  [64, 118, 149],
  [63, 116, 152],
  [62, 114, 155],
  [60, 112, 158],
  [59, 110, 162],
  [57, 108, 165],
  [56, 106, 168],
  [54, 104, 171],
  [53, 102, 174],
  [51, 100, 177],
  [50, 98, 180],
  [48, 96, 183],
  [47, 93, 185],
  [46, 91, 188],
  [45, 89, 191],
  [44, 86, 193],
  [43, 84, 196],
  [42, 81, 199],
  [41, 79, 201],
  [40, 76, 204],
  [40, 73, 206],
  [39, 70, 209],
  [38, 68, 211],
  [38, 65, 213],
  [37, 62, 216],
  [37, 59, 218],
  [37, 56, 220],
  [37, 53, 222],
  [37, 50, 224],
  [37, 47, 227],
  [38, 44, 228],
  [40, 41, 230],
  [42, 39, 232],
  [44, 36, 234],
];

export function palleteBuilder(colors: RgbColor[]) {
  return (d: number) => {
    const index = Math.round(d * 255);
    const [r, g, b, a] = colors[index];
    return colors[index].length === 3
      ? `rgb(${r},${g},${b})`
      : `rgba(${r},${g},${b},${a})`;
  };
}
export const buildColors = palleteBuilder(
  rgbColors.map(([r, g, b]) => [r, g, b, 0.8])
);

// referred to here: https://tiny.amazon.com/337xpvcq/githelaselasblobv1822stor
export const fillOutColors = (d: any, i: number, a: any[]) => {
  return buildColors(i / (a.length + 1));
};

export const anomalousDetectorsStaticColumn = [
  {
    field: 'name',
    name: 'Detector',
    sortable: true,
    truncateText: false,
    textOnly: true,
    render: (name: string, detector: Detector) => (
      <EuiLink href={`${PLUGIN_NAME}#/detectors/${detector.id}/results`}>
        {name}
      </EuiLink>
    ),
  },
  {
    field: 'featureAttributes',
    name: 'Features',
    sortable: false,
    truncateText: false,
    textOnly: true,
    render: (featureAttributes: FeatureAttributes[]) => {
      return featureAttributes.map(feature => {
        return <p>{feature.featureName}</p>;
      });
    },
  },
] as EuiBasicTableColumn<any>[];

export const visualizeAnomalyResultForXYChart = (
  anomalyResult: any
): object => {
  const actualAnomalyGrade = get(anomalyResult, AD_DOC_FIELDS.ANOMALY_GRADE, 0);
  return {
    ...anomalyResult,
    [AD_DOC_FIELDS.PLOT_TIME]: getFloorPlotTime(
      get(anomalyResult, AD_DOC_FIELDS.DATA_END_TIME, 0)
    ),
    [AD_DOC_FIELDS.ANOMALY_GRADE]:
      actualAnomalyGrade < SHOW_DECIMAL_NUMBER_THRESHOLD
        ? Number(actualAnomalyGrade).toExponential(2)
        : Number(actualAnomalyGrade).toFixed(2),
  };
};

export const getFloorPlotTime = (plotTime: number): number => {
  return Math.floor(plotTime / MIN_IN_MILLI_SECS) * MIN_IN_MILLI_SECS;
};

export const buildGetAnomalyResultQueryByRange = (
  timeRange: string,
  from: number,
  size: number,
  threshold: number,
  checkLastIndexOnly: boolean
) => {
  return {
    index: checkLastIndexOnly
      ? ANOMALY_RESULT_INDEX
      : `${ANOMALY_RESULT_INDEX}*`,
    size: size,
    from: from,
    query: {
      bool: {
        must: [
          {
            range: {
              [AD_DOC_FIELDS.ANOMALY_GRADE]: {
                gt: threshold,
              },
            },
          },
          {
            range: {
              [AD_DOC_FIELDS.DATA_START_TIME]: {
                gte: `now-${timeRange}`,
              },
            },
          },
        ],
        must_not: [
          {
            exists: {
              field: AD_DOC_FIELDS.ERROR,
            },
          },
        ],
      },
    },
    sort: {
      [AD_DOC_FIELDS.DATA_START_TIME]: SORT_DIRECTION.DESC,
    },
  };
};

export const getLatestAnomalyResultsByTimeRange = async (
  func: (request: any) => APIAction,
  timeRange: string,
  dispatch: Dispatch<any>,
  threshold: number,
  anomalySize: number,
  checkLastIndexOnly: boolean
): Promise<object[]> => {
  let from = 0;
  let anomalyResults = [] as object[];
  let numSingleBatchResults: number;
  do {
    const searchResponse = await dispatch(
      func(
        buildGetAnomalyResultQueryByRange(
          timeRange,
          from,
          anomalySize,
          threshold,
          checkLastIndexOnly
        )
      )
    );
    const searchAnomalyResponse = searchResponse.data.response;

    const numHits = get(searchAnomalyResponse, 'hits.total.value', 0);
    if (numHits === 0) {
      break;
    }

    const anomalies: any[] = get(searchAnomalyResponse, 'hits.hits', []).map(
      (result: any) => {
        return {
          [AD_DOC_FIELDS.DETECTOR_ID]: result._source.detector_id,
          [AD_DOC_FIELDS.ANOMALY_GRADE]: result._source.anomaly_grade,
          [AD_DOC_FIELDS.DATA_START_TIME]: result._source.data_start_time,
          [AD_DOC_FIELDS.DATA_END_TIME]: result._source.data_end_time,
        };
      }
    );
    anomalyResults = [...anomalyResults, ...anomalies];
    from += anomalySize;
    numSingleBatchResults = anomalies.length;
  } while (numSingleBatchResults === MAX_ANOMALIES);

  return anomalyResults;
};

export const getLatestAnomalyResultsForDetectorsByTimeRange = async (
  func: (request: any) => APIAction,
  selectedDetectors: DetectorListItem[],
  timeRange: string,
  dispatch: Dispatch<any>,
  threshold: number,
  anomalySize: number,
  detectorNum: number,
  checkLastIndexOnly: boolean
): Promise<object[]> => {
  const detectorAndIdMap = buildDetectorAndIdMap(selectedDetectors);
  let from = 0;
  let anomalyResults = [] as object[];
  let numSingleBatchResults: number;
  do {
    const searchResponse = await dispatch(
      func(
        buildGetAnomalyResultQueryByRange(
          timeRange,
          from,
          anomalySize,
          threshold,
          checkLastIndexOnly
        )
      )
    );
    const searchAnomalyResponse = searchResponse.data.response;

    const numHits = get(searchAnomalyResponse, 'hits.total.value', 0);
    if (numHits === 0) {
      break;
    }

    const anomalies: any[] = get(searchAnomalyResponse, 'hits.hits', []).map(
      (result: any) => {
        const detector = detectorAndIdMap.get(result._source.detector_id);
        return {
          [AD_DOC_FIELDS.DETECTOR_ID]: result._source.detector_id,
          [AD_DOC_FIELDS.ANOMALY_GRADE]: result._source.anomaly_grade,
          [AD_DOC_FIELDS.DATA_START_TIME]: result._source.data_start_time,
          [AD_DOC_FIELDS.DATA_END_TIME]: result._source.data_end_time,
          [AD_DOC_FIELDS.DETECTOR_NAME]: get(
            detector,
            AD_DOC_FIELDS.DETECTOR_NAME,
            ''
          ),
        };
      }
    );
    anomalyResults = [...anomalyResults, ...anomalies];
    from += anomalySize;
    numSingleBatchResults = anomalies.length;
  } while (numSingleBatchResults === MAX_ANOMALIES);

  const filteredAnomalyResults = anomalyResults.filter(anomaly =>
    detectorAndIdMap.has(get(anomaly, AD_DOC_FIELDS.DETECTOR_ID, ''))
  );

  const orderedLiveAnomalyData = orderBy(
    filteredAnomalyResults,
    // sort by data start time in desc order
    anomalyData => get(anomalyData, AD_DOC_FIELDS.DATA_START_TIME, ''),
    SORT_DIRECTION.DESC
  );
  const latestAnomalousDetectorIds = selectLatestAnomalousDetectorIds(
    orderedLiveAnomalyData,
    detectorNum
  );
  if (!isEmpty(latestAnomalousDetectorIds)) {
    const finalLiveAnomalyResult = orderedLiveAnomalyData.filter(anomalyData =>
      latestAnomalousDetectorIds.has(
        get(anomalyData, AD_DOC_FIELDS.DETECTOR_ID, '')
      )
    );
    return finalLiveAnomalyResult;
  }
  // data to be returned here is the ones with anomaly grade === 0
  // indicating there exists detector running, but no anomalies
  return orderedLiveAnomalyData;
};

const buildDetectorAndIdMap = (
  selectedDetectors: DetectorListItem[]
): Map<string, DetectorListItem> => {
  const detectorAndIdMap = new Map<string, DetectorListItem>();
  if (selectedDetectors) {
    selectedDetectors.forEach(detector => {
      detectorAndIdMap.set(detector.id, detector);
    });
  }
  return detectorAndIdMap;
};

const selectLatestAnomalousDetectorIds = (
  orderedAnomalyData: object[],
  neededDetectorNum: number
): Set<string> => {
  const anomalousDetectorIds = new Set(
    orderedAnomalyData
      .filter(
        anomalyData => get(anomalyData, AD_DOC_FIELDS.ANOMALY_GRADE, 0) > 0
      )
      .map(anomalyData => get(anomalyData, AD_DOC_FIELDS.DETECTOR_ID, ''))
  );

  return new Set(Array.from(anomalousDetectorIds).slice(0, neededDetectorNum));
};

export const getAnomalyDistributionForDetectorsByTimeRange = async (
  func: (request: any) => APIAction,
  selectedDetectors: DetectorListItem[],
  timeRange: string,
  dispatch: Dispatch<any>,
  threshold: number,
  checkLastIndexOnly: boolean
) => {
  const aggregationName = 'anomaly_dist';
  const detectorAndIdMap = buildDetectorAndIdMap(selectedDetectors);

  const getResultQuery = buildGetAnomalyResultQueryByRange(
    timeRange,
    0,
    0,
    threshold,
    checkLastIndexOnly
  );
  const anomaly_dist_aggs = {
    aggs: {
      [aggregationName]: {
        terms: {
          field: AD_DOC_FIELDS.DETECTOR_ID,
          size: MAX_DETECTORS,
        },
      },
    },
  };
  const finalQuery = Object.assign({}, getResultQuery, anomaly_dist_aggs);

  const result = await dispatch(func(finalQuery));

  const detectorsAggResults = get(
    result,
    `data.response.aggregations.${aggregationName}.buckets`,
    []
  );

  const finalDetectorDistributionResult = [] as object[];
  for (let detectorResult of detectorsAggResults) {
    const detectorId = get(detectorResult, 'key', '');
    if (detectorAndIdMap.has(detectorId)) {
      const detector = detectorAndIdMap.get(detectorId);
      finalDetectorDistributionResult.push({
        [AD_DOC_FIELDS.DETECTOR_ID]: detectorId,
        [AD_DOC_FIELDS.DETECTOR_NAME]: get(
          detector,
          AD_DOC_FIELDS.DETECTOR_NAME,
          ''
        ),
        [AD_DOC_FIELDS.INDICES]: get(
          detector,
          AD_DOC_FIELDS.INDICES,
          ''
        ).toString(),
        count: get(detectorResult, 'doc_count', 0),
      });
    }
  }

  return finalDetectorDistributionResult;
};
