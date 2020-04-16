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
} from '../models/types';
import { Router } from '../router';
import { SORT_DIRECTION, AD_DOC_FIELDS } from '../utils/constants';
import { mapKeysDeep, toCamel, toSnake } from '../utils/helpers';
import {
  anomalyResultMapper,
  convertDetectorKeysToCamelCase,
  convertDetectorKeysToSnakeCase,
  getResultAggregationQuery,
} from './utils/adHelpers';
import { DETECTOR_STATE } from '../../public/pages/utils/constants';

type PutDetectorParams = {
  detectorId: string;
  ifSeqNo?: string;
  ifPrimaryTerm?: string;
  body: string;
};

export default function(apiRouter: Router) {
  apiRouter.post('/detectors', putDetector);
  apiRouter.put('/detectors/{detectorId}', putDetector);
  apiRouter.post('/detectors/_search', searchDetector);
  apiRouter.get('/detectors/{detectorId}', getDetector);
  apiRouter.get('/detectors', getDetectors);
  apiRouter.post('/detectors/{detectorId}/preview', previewDetector);
  apiRouter.get('/detectors/{detectorId}/results', getAnomalyResults);
  apiRouter.delete('/detectors/{detectorId}', deleteDetector);
  apiRouter.post('/detectors/{detectorId}/start', startDetector);
  apiRouter.post('/detectors/{detectorId}/stop', stopDetector);
  apiRouter.get('/detectors/{detectorId}/_profile', getDetectorProfile);
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
    return { ok: false, error: err.body || err.message };
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
    const requestBody = JSON.stringify(mapKeysDeep(req.payload, toSnake));
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
    return { ok: false, error: err.message };
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
    //FIXME: This is temporary as backend should send error message inside message instead of body
    if (err.statusCode === 400) {
      return { ok: false, error: err.body };
    }
    return { ok: false, error: err.message };
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
    const resp = {
      ...response.anomaly_detector,
      id: response._id,
      primaryTerm: response._primary_term,
      seqNo: response._seq_no,
      adJob: { ...response.anomaly_detector_job },
    };
    return {
      ok: true,
      response: convertDetectorKeysToCamelCase(resp) as Detector,
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to get detector', err);
    return { ok: false, error: err.message };
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
    return { ok: false, error: err.body || err.message };
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
    return { ok: false, error: err.body || err.message };
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
    return { ok: false, error: err.body || err.message };
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
    if (
      err.statusCode === 404 &&
      get<string>(err, 'body.error.type', '') === 'index_not_found_exception'
    ) {
      return { ok: true, response: { totalDetectors: 0, detectors: [] } };
    }
    console.log('Anomaly detector - Unable to search detectors', err);
    return { ok: false, error: err.message };
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
          query: `*${search
            .trim()
            .split(' ')
            .join('* *')}*`,
        },
      });
    }
    if (indices.trim()) {
      mustQueries.push({
        query_string: {
          fields: ['indices'],
          default_operator: 'OR',
          query: `*${indices
            .trim()
            .split(' ')
            .join('* *')}*`,
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
          // TODO: get the state of the detector once possible (enabled/disabled for now)
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
    const allIds = finalDetectors.map(detector => detector.id);

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
        console.log(
          'Anomaly detector - Unable to retrieve detector state',
          err
        );
      }
    });
    const detectorStates = await Promise.all(detectorStatePromises);
    detectorStates.forEach(detectorState => {
      //@ts-ignore
      detectorState.state = DETECTOR_STATE[detectorState.state];
    });

    // check if there was any failures
    detectorStates.forEach(detectorState => {
      /*
        If the error starts with 'Stopped detector', then an EndRunException was thrown.
        All EndRunExceptions are related to initialization failures except for the
        unknown prediction error which contains the message "We might have bugs".
      */
      if (
        detectorState.state === DETECTOR_STATE.DISABLED &&
        detectorState.error !== undefined &&
        detectorState.error.includes('Stopped detector')
      ) {
        detectorState.state = detectorState.error.includes('We might have bugs')
          ? DETECTOR_STATE.UNEXPECTED_FAILURE
          : DETECTOR_STATE.INIT_FAILURE;
      }
    });

    // update the final detectors to include the detector state
    finalDetectors.forEach((detector, i) => {
      detector.curState = detectorStates[i].state;
    });

    return {
      ok: true,
      response: {
        totalDetectors,
        detectorList: Object.values(finalDetectors),
      },
    };
  } catch (err) {
    console.log('Anomaly detector - Unable to list detectors', err);
    return { ok: false, error: err.message };
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
      range = undefined,
      //@ts-ignore
    } = req.query as {
      from: number;
      size: number;
      sortDirection: SORT_DIRECTION;
      sortField?: string;
      range?: any;
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

    let rangeObj = range;

    if (range !== undefined && typeof range === 'string') {
      rangeObj = JSON.parse(range);
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
            { ...(rangeObj !== undefined && { range: rangeObj }) },
          ],
        },
      },
    };

    const response = await callWithRequest(req, 'ad.searchResults', {
      body: requestBody,
    });

    const totalResults: number = get(response, 'hits.total.value', 0);
    // Get all detectors from search detector API
    const detectorResults: AnomalyResult[] = get(response, 'hits.hits', []).map(
      (result: any) => ({
        startTime: result._source.data_start_time,
        endTime: result._source.data_end_time,
        confidence:
          result._source.confidence != null && result._source.confidence > 0
            ? Number.parseFloat(result._source.confidence).toFixed(3)
            : 0,
        anomalyGrade:
          result._source.anomaly_grade != null &&
          result._source.anomaly_grade > 0
            ? Number.parseFloat(result._source.anomaly_grade).toFixed(3)
            : 0,
      })
    );
    return {
      ok: true,
      response: {
        totalAnomalies: totalResults,
        results: detectorResults,
      },
    };
  } catch (err) {
    console.log('Anomaly detector - Unable get results', err);
    return { ok: false, error: err.message };
  }
};
