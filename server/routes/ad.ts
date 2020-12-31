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

import { Request, ResponseToolkit } from 'hapi';
//@ts-ignore
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import pullAll from 'lodash/pullAll';
//@ts-ignore
import { CallClusterWithRequest } from 'src/legacy/core_plugins/elasticsearch';
import { AnomalyResults, SearchResponse } from '../models/interfaces';
import {
  AnomalyResult,
  AnomalyResultsResponse,
  Detector,
  GetDetectorsQueryParams,
  ServerResponse,
  FeatureResult,
  DateRangeFilter,
} from '../models/types';
import { Router } from '../router';
import {
  SORT_DIRECTION,
  AD_DOC_FIELDS,
  ENTITY_FIELD,
  ENTITY_NAME_PATH_FIELD,
  ENTITY_VALUE_PATH_FIELD,
} from '../utils/constants';
import {
  mapKeysDeep,
  toCamel,
  toFixedNumberForAnomaly,
} from '../utils/helpers';
import {
  anomalyResultMapper,
  convertDetectorKeysToCamelCase,
  convertDetectorKeysToSnakeCase,
  convertPreviewInputKeysToSnakeCase,
  getResultAggregationQuery,
  getFinalDetectorStates,
  getDetectorsWithJob,
  getDetectorInitProgress,
  isIndexNotFoundError,
  getErrorMessage,
} from './utils/adHelpers';
import { isEmpty, set } from 'lodash';

type PutDetectorParams = {
  detectorId: string;
  ifSeqNo?: string;
  ifPrimaryTerm?: string;
  body: string;
};

export default function (apiRouter: Router) {
  apiRouter.post('/detectors', putDetector);
  apiRouter.put('/detectors/{detectorId}', putDetector);
  apiRouter.post('/detectors/_search', searchDetector);
  apiRouter.post('/detectors/results/_search', searchResults);
  apiRouter.get('/detectors/{detectorId}', getDetector);
  apiRouter.get('/detectors', getDetectors);
  apiRouter.post('/detectors/{detectorId}/preview', previewDetector);
  apiRouter.get('/detectors/{detectorId}/results', getAnomalyResults);
  apiRouter.delete('/detectors/{detectorId}', deleteDetector);
  apiRouter.post('/detectors/{detectorId}/start', startDetector);
  apiRouter.post('/detectors/{detectorId}/stop', stopDetector);
  apiRouter.get('/detectors/{detectorId}/_profile', getDetectorProfile);
  apiRouter.get('/detectors/{detectorName}/_match', matchDetector);
  apiRouter.get('/detectors/_count', getDetectorCount);
}

const deleteDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<AnomalyResults>> => {
  try {
    const { detectorId } = req.params;
    const response = await callWithRequest(req, 'ad.deleteDetector', {
      detectorId,
    });
    return {
      ok: true,
      response: response,
    };
  } catch (err) {
    console.log('Anomaly detector - deleteDetector', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const previewDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<AnomalyResults>> => {
  try {
    const { detectorId } = req.params;
    //@ts-ignore
    const requestBody = JSON.stringify(
      convertPreviewInputKeysToSnakeCase(req.payload)
    );
    const response = await callWithRequest(req, 'ad.previewDetector', {
      detectorId,
      body: requestBody,
    });
    const transformedKeys = mapKeysDeep(response, toCamel);
    return {
      ok: true,
      //@ts-ignore
      response: anomalyResultMapper(transformedKeys.anomalyResult),
    };
  } catch (err) {
    console.log('Anomaly detector - previewDetector', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const putDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<Detector>> => {
  try {
    const { detectorId } = req.params;
    const { ifSeqNo, ifPrimaryTerm } = req.query as {
      ifSeqNo?: string;
      ifPrimaryTerm?: string;
    };
    const requestBody = JSON.stringify(
      convertDetectorKeysToSnakeCase(req.payload)
    );
    let params: PutDetectorParams = {
      detectorId: detectorId,
      ifSeqNo: ifSeqNo,
      ifPrimaryTerm: ifPrimaryTerm,
      body: requestBody,
    };
    let response;
    if (ifSeqNo && ifPrimaryTerm) {
      response = await callWithRequest(req, 'ad.updateDetector', params);
    } else {
      response = await callWithRequest(req, 'ad.createDetector', {
        body: params.body,
      });
    }
    const resp = {
      ...response.anomaly_detector,
      id: response._id,
      primaryTerm: response._primary_term,
      seqNo: response._seq_no,
    };
    return {
      ok: true,
      response: convertDetectorKeysToCamelCase(resp) as Detector,
    };
  } catch (err) {
    console.log('Anomaly detector - PutDetector', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const getDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<Detector>> => {
  try {
    const { detectorId } = req.params;
    const response = await callWithRequest(req, 'ad.getDetector', {
      detectorId,
    });
    let detectorState;
    try {
      const detectorStateResp = await callWithRequest(
        req,
        'ad.detectorProfile',
        {
          detectorId: detectorId,
        }
      );
      const detectorStates = getFinalDetectorStates(
        [detectorStateResp],
        [convertDetectorKeysToCamelCase(response.anomaly_detector)]
      );
      detectorState = detectorStates[0];
    } catch (err) {
      console.log('Anomaly detector - Unable to retrieve detector state', err);
    }
    const resp = {
      ...response.anomaly_detector,
      id: response._id,
      primaryTerm: response._primary_term,
      seqNo: response._seq_no,
      adJob: { ...response.anomaly_detector_job },
      ...(detectorState !== undefined
        ? {
            curState: detectorState.state,
            stateError: detectorState.error,
            initProgress: getDetectorInitProgress(detectorState),
          }
        : {}),
    };
    return {
      ok: true,
      response: convertDetectorKeysToCamelCase(resp) as Detector,
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to get detector', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const startDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<AnomalyResults>> => {
  try {
    const { detectorId } = req.params;
    const response = await callWithRequest(req, 'ad.startDetector', {
      detectorId,
    });
    return {
      ok: true,
      response: response,
    };
  } catch (err) {
    console.log('Anomaly detector - startDetector', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const stopDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<AnomalyResults>> => {
  try {
    const { detectorId } = req.params;
    const response = await callWithRequest(req, 'ad.stopDetector', {
      detectorId,
    });
    return {
      ok: true,
      response: response,
    };
  } catch (err) {
    console.log('Anomaly detector - stopDetector', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const getDetectorProfile = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<any>> => {
  try {
    const { detectorId } = req.params;
    const response = await callWithRequest(req, 'ad.detectorProfile', {
      detectorId,
    });
    return {
      ok: true,
      response,
    };
  } catch (err) {
    console.log('Anomaly detector - detectorProfile', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const searchDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<any>> => {
  try {
    //@ts-ignore
    const requestBody = JSON.stringify(req.payload);
    const response: SearchResponse<Detector> = await callWithRequest(
      req,
      'ad.searchDetector',
      { body: requestBody }
    );
    const totalDetectors = get(response, 'hits.total.value', 0);
    const detectors = get(response, 'hits.hits', []).map((detector: any) => ({
      ...convertDetectorKeysToCamelCase(detector._source),
      id: detector._id,
      seqNo: detector._seq_no,
      primaryTerm: detector._primary_term,
    }));
    return {
      ok: true,
      response: {
        totalDetectors,
        detectors,
      },
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to search detectors', err);
    if (isIndexNotFoundError(err)) {
      return { ok: true, response: { totalDetectors: 0, detectors: [] } };
    }
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const searchResults = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<any>> => {
  try {
    //@ts-ignore
    const requestBody = JSON.stringify(req.payload);
    const response = await callWithRequest(req, 'ad.searchResults', {
      body: requestBody,
    });
    return {
      ok: true,
      response,
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to search anomaly result', err);
    if (isIndexNotFoundError(err)) {
      return { ok: true, response: { totalDetectors: 0, detectors: [] } };
    }
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const getDetectors = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<any>> => {
  try {
    const {
      from = 0,
      size = 20,
      search = '',
      indices = '',
      sortDirection = SORT_DIRECTION.DESC,
      sortField = 'name',
      //@ts-ignore
    } = req.query as GetDetectorsQueryParams;
    const mustQueries = [];
    if (search.trim()) {
      mustQueries.push({
        query_string: {
          fields: ['name', 'description'],
          default_operator: 'AND',
          query: `*${search.trim().split('-').join('* *')}*`,
        },
      });
    }
    if (indices.trim()) {
      mustQueries.push({
        query_string: {
          fields: ['indices'],
          default_operator: 'OR',
          query: `*${indices.trim().split(' ').join('* *')}*`,
        },
      });
    }
    //Allowed sorting columns
    const sortQueryMap = {
      name: { 'name.keyword': sortDirection },
      indices: { 'indices.keyword': sortDirection },
      lastUpdateTime: { last_update_time: sortDirection },
    } as { [key: string]: object };
    let sort = {};
    const sortQuery = sortQueryMap[sortField];
    if (sortQuery) {
      sort = sortQuery;
    }
    //Preparing search request
    const requestBody = {
      sort,
      size,
      from,
      query: {
        bool: {
          must: mustQueries,
        },
      },
    };
    const response: SearchResponse<Detector> = await callWithRequest(
      req,
      'ad.searchDetector',
      { body: requestBody }
    );
    const totalDetectors = get(response, 'hits.total.value', 0);
    //Get all detectors from search detector API
    const allDetectors = get(response, 'hits.hits', []).reduce(
      (acc: any, detector: any) => ({
        ...acc,
        [detector._id]: {
          id: detector._id,
          description: get(detector, '_source.description', ''),
          indices: get(detector, '_source.indices', []),
          lastUpdateTime: get(detector, '_source.last_update_time', 0),
          ...convertDetectorKeysToCamelCase(get(detector, '_source', {})),
        },
      }),
      {}
    );
    //Given each detector from previous result, get aggregation to power list
    const allDetectorIds = Object.keys(allDetectors);
    const aggregationResult = await callWithRequest(req, 'ad.searchResults', {
      body: getResultAggregationQuery(allDetectorIds, {
        from,
        size,
        sortField,
        sortDirection,
        search,
        indices,
      }),
    });
    const aggsDetectors = get(
      aggregationResult,
      'aggregations.unique_detectors.buckets',
      []
    ).reduce((acc: any, agg: any) => {
      return {
        ...acc,
        [agg.key]: {
          ...allDetectors[agg.key],
          totalAnomalies: agg.total_anomalies_in_24hr.doc_count,
          lastActiveAnomaly: agg.latest_anomaly_time.value,
        },
      };
    }, {});

    // Aggregation will not return values where anomalies for detectors are not generated, loop through it and fill values with 0
    const unUsedDetectors = pullAll(
      allDetectorIds,
      Object.keys(aggsDetectors)
    ).reduce((acc: any, unusedDetector: string) => {
      return {
        ...acc,
        [unusedDetector]: {
          ...allDetectors[unusedDetector],
          totalAnomalies: 0,
          lastActiveAnomaly: 0,
        },
      };
    }, {});

    // If sorting criteria is from the aggregation manage pagination in memory.
    let finalDetectors = orderBy<any>(
      { ...aggsDetectors, ...unUsedDetectors },
      [sortField],
      [sortDirection]
    );
    if (!sortQueryMap[sortField]) {
      finalDetectors = Object.values(finalDetectors)
        .slice(from, from + size)
        .reduce(
          (acc, detector: any) => ({ ...acc, [detector.id]: detector }),
          {}
        );
    }

    // Get detector state as well: loop through the ids to get each detector's state using profile api
    const allIds = finalDetectors.map((detector) => detector.id);

    const detectorStatePromises = allIds.map(async (id: string) => {
      try {
        const detectorStateResp = await callWithRequest(
          req,
          'ad.detectorProfile',
          {
            detectorId: id,
          }
        );
        return detectorStateResp;
      } catch (err) {
        console.log('Error getting detector profile ', err);
        return Promise.reject(
          new Error(
            'Error retrieving all detector states: ' + getErrorMessage(err)
          )
        );
      }
    });
    const detectorStateResponses = await Promise.all(
      detectorStatePromises
    ).catch((err) => {
      throw err;
    });
    const finalDetectorStates = getFinalDetectorStates(
      detectorStateResponses,
      finalDetectors
    );
    // update the final detectors to include the detector state
    finalDetectors.forEach((detector, i) => {
      detector.curState = finalDetectorStates[i].state;
    });

    // get ad job
    const detectorsWithJobPromises = allIds.map(async (id: string) => {
      try {
        const detectorResp = await callWithRequest(req, 'ad.getDetector', {
          detectorId: id,
        });
        return detectorResp;
      } catch (err) {
        console.log('Error getting detector ', err);
        return Promise.reject(
          new Error('Error retrieving all detectors: ' + getErrorMessage(err))
        );
      }
    });
    const detectorsWithJobResponses = await Promise.all(
      detectorsWithJobPromises
    ).catch((err) => {
      throw err;
    });
    const finalDetectorsWithJob = getDetectorsWithJob(
      detectorsWithJobResponses
    );

    // update the final detectors to include the detector enabledTime
    finalDetectors.forEach((detector, i) => {
      detector.enabledTime = finalDetectorsWithJob[i].enabledTime;
    });

    return {
      ok: true,
      response: {
        totalDetectors,
        detectorList: Object.values(finalDetectors),
      },
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to search detectors', err);
    if (isIndexNotFoundError(err)) {
      return { ok: true, response: { totalDetectors: 0, detectorList: [] } };
    }
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const getAnomalyResults = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<AnomalyResultsResponse>> => {
  try {
    const {
      from = 0,
      size = 20,
      sortDirection = SORT_DIRECTION.DESC,
      sortField = AD_DOC_FIELDS.DATA_START_TIME,
      dateRangeFilter = undefined,
      anomalyThreshold = -1,
      entityName = undefined,
      entityValue = undefined,
      //@ts-ignore
    } = req.query as {
      from: number;
      size: number;
      sortDirection: SORT_DIRECTION;
      sortField?: string;
      dateRangeFilter?: string;
      anomalyThreshold: number;
      entityName: string;
      entityValue: string;
    };
    const { detectorId } = req.params;

    //Allowed sorting columns
    const sortQueryMap = {
      anomalyGrade: { anomaly_grade: sortDirection },
      confidence: { confidence: sortDirection },
      [AD_DOC_FIELDS.DATA_START_TIME]: {
        [AD_DOC_FIELDS.DATA_START_TIME]: sortDirection,
      },
      [AD_DOC_FIELDS.DATA_END_TIME]: {
        [AD_DOC_FIELDS.DATA_END_TIME]: sortDirection,
      },
    } as { [key: string]: object };
    let sort = {};
    const sortQuery = sortQueryMap[sortField];
    if (sortQuery) {
      sort = sortQuery;
    }

    //Preparing search request
    const requestBody = {
      sort,
      size,
      from,
      query: {
        bool: {
          filter: [
            {
              term: {
                detector_id: detectorId,
              },
            },

            {
              range: {
                anomaly_grade: {
                  gt: anomalyThreshold,
                },
              },
            },
            ...(entityName && entityValue
              ? [
                  {
                    nested: {
                      path: ENTITY_FIELD,
                      query: {
                        term: {
                          [ENTITY_NAME_PATH_FIELD]: {
                            value: entityName,
                          },
                        },
                      },
                    },
                  },
                  {
                    nested: {
                      path: ENTITY_FIELD,
                      query: {
                        term: {
                          [ENTITY_VALUE_PATH_FIELD]: {
                            value: entityValue,
                          },
                        },
                      },
                    },
                  },
                ]
              : []),
          ],
        },
      },
    };

    try {
      const dateRangeFilterObj = (dateRangeFilter
        ? JSON.parse(dateRangeFilter)
        : undefined) as DateRangeFilter;
      const filterSize = requestBody.query.bool.filter.length;
      if (dateRangeFilterObj && dateRangeFilterObj.fieldName) {
        (dateRangeFilterObj.startTime || dateRangeFilterObj.endTime) &&
          set(
            requestBody.query.bool.filter,
            `${filterSize}.range.${dateRangeFilterObj.fieldName}.format`,
            'epoch_millis'
          );

        dateRangeFilterObj.startTime &&
          set(
            requestBody.query.bool.filter,
            `${filterSize}.range.${dateRangeFilterObj.fieldName}.gte`,
            dateRangeFilterObj.startTime
          );

        dateRangeFilterObj.endTime &&
          set(
            requestBody.query.bool.filter,
            `${filterSize}.range.${dateRangeFilterObj.fieldName}.lte`,
            dateRangeFilterObj.endTime
          );
      }
    } catch (error) {
      console.log('wrong date range filter', error);
    }

    const response = await callWithRequest(req, 'ad.searchResults', {
      body: requestBody,
    });

    const totalResults: number = get(response, 'hits.total.value', 0);

    const detectorResult: AnomalyResult[] = [];
    const featureResult: { [key: string]: FeatureResult[] } = {};
    get(response, 'hits.hits', []).forEach((result: any) => {
      detectorResult.push({
        startTime: result._source.data_start_time,
        endTime: result._source.data_end_time,
        plotTime: result._source.data_end_time,
        confidence:
          result._source.confidence != null &&
          result._source.confidence !== 'NaN' &&
          result._source.confidence > 0
            ? toFixedNumberForAnomaly(
                Number.parseFloat(result._source.confidence)
              )
            : 0,
        anomalyGrade:
          result._source.anomaly_grade != null &&
          result._source.anomaly_grade !== 'NaN' &&
          result._source.anomaly_grade > 0
            ? toFixedNumberForAnomaly(
                Number.parseFloat(result._source.anomaly_grade)
              )
            : 0,
        ...(result._source.entity != null
          ? { entity: result._source.entity }
          : {}),
        // TODO: we should refactor other places to read feature data from
        // AnomalyResult, instead of having separate FeatureData which is hard
        // to know feature data belongs to which anomaly result
        features: getFeatureData(result),
      });
      result._source.feature_data.forEach((featureData: any) => {
        if (!featureResult[featureData.feature_id]) {
          featureResult[featureData.feature_id] = [];
        }
        featureResult[featureData.feature_id].push({
          startTime: result._source.data_start_time,
          endTime: result._source.data_end_time,
          plotTime: result._source.data_end_time,
          data:
            featureData.data != null && featureData.data !== 'NaN'
              ? toFixedNumberForAnomaly(Number.parseFloat(featureData.data))
              : 0,
        });
      });
    });
    return {
      ok: true,
      response: {
        totalAnomalies: totalResults,
        results: detectorResult,
        featureResults: featureResult,
      },
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to get results', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const matchDetector = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<AnomalyResults>> => {
  try {
    const { detectorName } = req.params;
    const response = await callWithRequest(req, 'ad.matchDetector', {
      detectorName,
    });
    return {
      ok: true,
      response: response,
    };
  } catch (err) {
    console.log('Anomaly detector - matchDetector', err);
    return { ok: false, error: getErrorMessage(err) };
  }
};

const getDetectorCount = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<AnomalyResults>> => {
  try {
    const response = await callWithRequest(req, 'ad.detectorCount');
    return {
      ok: true,
      response: response,
    };
  } catch (err) {
    console.log('Anomaly detector - getDetectorCount', err);
    return { ok: false, error: getErrorMessage(err) };
  }
};

const getFeatureData = (rawResult: any) => {
  const featureResult: { [key: string]: FeatureResult } = {};
  rawResult._source.feature_data.forEach((featureData: any) => {
    featureResult[featureData.feature_id] = {
      startTime: rawResult._source.data_start_time,
      endTime: rawResult._source.data_end_time,
      plotTime: rawResult._source.data_end_time,
      data:
        featureData.data != null && featureData.data !== 'NaN'
          ? toFixedNumberForAnomaly(Number.parseFloat(featureData.data))
          : 0,
    };
  });
  return featureResult;
};
