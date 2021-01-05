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

//@ts-ignore
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import pullAll from 'lodash/pullAll';
import { AnomalyResults, SearchResponse } from '../models/interfaces';
import {
  AnomalyResult,
  AnomalyResultsResponse,
  Detector,
  GetDetectorsQueryParams,
  ServerResponse,
  FeatureResult,
} from '../models/types';
import { Router } from '../router';
import {
  SORT_DIRECTION,
  AD_DOC_FIELDS,
  ENTITY_FIELD,
  ENTITY_NAME_PATH_FIELD,
  ENTITY_VALUE_PATH_FIELD,
  DETECTOR_STATE,
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
  getRealtimeDetectors,
  getHistoricalDetectors,
  getDetectorTasks,
  appendTaskInfo,
  getDetectorResults,
  getHistoricalDetectorState,
} from './utils/adHelpers';
import { isNumber, set } from 'lodash';
import {
  RequestHandlerContext,
  KibanaRequest,
  KibanaResponseFactory,
  IKibanaResponse,
} from '../../../../src/core/server';

type PutDetectorParams = {
  detectorId: string;
  ifSeqNo?: string;
  ifPrimaryTerm?: string;
  body: string;
};

export function registerADRoutes(apiRouter: Router, adService: AdService) {
  apiRouter.post('/detectors', adService.putDetector);
  apiRouter.put('/detectors/{detectorId}', adService.putDetector);
  apiRouter.post('/detectors/_search', adService.searchDetector);
  apiRouter.post('/detectors/results/_search', adService.searchResults);
  apiRouter.get('/detectors/{detectorId}', adService.getDetector);
  apiRouter.get('/detectors', adService.getDetectors);
  apiRouter.post('/detectors/{detectorId}/preview', adService.previewDetector);
  apiRouter.get(
    '/detectors/{id}/results/{isHistorical}',
    adService.getAnomalyResults
  );
  apiRouter.delete('/detectors/{detectorId}', adService.deleteDetector);
  apiRouter.post('/detectors/{detectorId}/start', adService.startDetector);
  apiRouter.post('/detectors/{detectorId}/stop', adService.stopDetector);
  apiRouter.get(
    '/detectors/{detectorId}/_profile',
    adService.getDetectorProfile
  );
  apiRouter.get('/detectors/{detectorName}/_match', adService.matchDetector);
  apiRouter.get('/detectors/_count', adService.getDetectorCount);
  apiRouter.get('/detectors/historical', adService.getHistoricalDetectors);
}

export default class AdService {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  deleteDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.deleteDetector', {
          detectorId,
        });
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: response,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - deleteDetector', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  previewDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const requestBody = JSON.stringify(
        convertPreviewInputKeysToSnakeCase(request.body)
      );
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.previewDetector', {
          detectorId,
          body: requestBody,
        });
      const transformedKeys = mapKeysDeep(response, toCamel);
      return kibanaResponse.ok({
        body: {
          ok: true,
          //@ts-ignore
          response: anomalyResultMapper(transformedKeys.anomalyResult),
        },
      });
    } catch (err) {
      console.log('Anomaly detector - previewDetector', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  putDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      //@ts-ignore
      const ifSeqNo = request.body.seqNo;
      //@ts-ignore
      const ifPrimaryTerm = request.body.primaryTerm;

      const requestBody = JSON.stringify(
        convertDetectorKeysToSnakeCase(request.body)
      );
      let params: PutDetectorParams = {
        detectorId: detectorId,
        ifSeqNo: ifSeqNo,
        ifPrimaryTerm: ifPrimaryTerm,
        body: requestBody,
      };
      let response;

      if (isNumber(ifSeqNo) && isNumber(ifPrimaryTerm)) {
        response = await this.client
          .asScoped(request)
          .callAsCurrentUser('ad.updateDetector', params);
      } else {
        response = await this.client
          .asScoped(request)
          .callAsCurrentUser('ad.createDetector', {
            body: params.body,
          });
      }
      const resp = {
        ...response.anomaly_detector,
        id: response._id,
        primaryTerm: response._primary_term,
        seqNo: response._seq_no,
      };
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: convertDetectorKeysToCamelCase(resp) as Detector,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - PutDetector', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  getDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.getDetector', {
          detectorId,
        });

      // Considering any detector with no detection date range to be a realtime detector
      const isRealtimeDetector =
        get(response, 'anomaly_detector.detection_date_range', null) === null;
      const task = get(response, 'anomaly_detection_task', null);
      const taskId = get(response, 'anomaly_detection_task.task_id', null);
      const taskProgress = get(
        response,
        'anomaly_detection_task.task_progress',
        null
      );

      // Getting detector state, depending on realtime or historical
      let detectorState;
      if (isRealtimeDetector) {
        try {
          const detectorStateResp = await this.client
            .asScoped(request)
            .callAsCurrentUser('ad.detectorProfile', {
              detectorId: detectorId,
            });
          const detectorStates = getFinalDetectorStates(
            [detectorStateResp],
            [convertDetectorKeysToCamelCase(response.anomaly_detector)]
          );
          detectorState = detectorStates[0];
        } catch (err) {
          console.log(
            'Anomaly detector - Unable to retrieve detector state',
            err
          );
        }
      } else {
        detectorState = { state: getHistoricalDetectorState(task) };
      }

      // Getting the detector job, depending on realtime or historical
      let adJob = get(response, 'anomaly_detector_job', null);
      if (task && adJob === null) {
        adJob = {
          name: get(response, '_id'),
          schedule: {
            interval: {
              start_time: get(task, 'last_update_time'),
              period: 1,
              unit: 'Minutes',
            },
          },
          window_delay: get(response, 'anomaly_detector.window_delay'),
          enabled: detectorState === DETECTOR_STATE.RUNNING ? true : false,
          enabled_time: get(task, 'execution_start_time'),
          disabled_time: get(task, 'execution_end_time')
            ? get(task, 'execution_end_time')
            : get(task, 'last_update_time'),
          last_update_time: get(task, 'last_update_time'),
          lock_duration_seconds: 60,
        };
      }

      const resp = {
        ...response.anomaly_detector,
        id: response._id,
        primaryTerm: response._primary_term,
        seqNo: response._seq_no,
        adJob: { ...adJob },
        ...(isRealtimeDetector
          ? {
              curState: detectorState.state,
              stateError: detectorState.error,
              initProgress: getDetectorInitProgress(detectorState),
            }
          : {
              curState: detectorState.state,
            }),
        ...(!isRealtimeDetector
          ? {
              taskId: taskId,
              taskProgress: taskProgress,
            }
          : {}),
      };

      return kibanaResponse.ok({
        body: {
          ok: true,
          response: convertDetectorKeysToCamelCase(resp) as Detector,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to get detector', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  startDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.startDetector', {
          detectorId,
        });
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: response,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - startDetector', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  stopDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.stopDetector', {
          detectorId,
        });
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: response,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - stopDetector', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  getDetectorProfile = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorId } = request.params as { detectorId: string };
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.detectorProfile', {
          detectorId,
        });
      return kibanaResponse.ok({
        body: {
          ok: true,
          response,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - detectorProfile', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  searchDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const requestBody = JSON.stringify(request.body);
      const response: SearchResponse<Detector> = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.searchDetector', { body: requestBody });
      const totalDetectors = get(response, 'hits.total.value', 0);
      const detectors = get(response, 'hits.hits', []).map((detector: any) => ({
        ...convertDetectorKeysToCamelCase(detector._source),
        id: detector._id,
        seqNo: detector._seq_no,
        primaryTerm: detector._primary_term,
      }));
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: {
            totalDetectors,
            detectors,
          },
        },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to search detectors', err);
      if (isIndexNotFoundError(err)) {
        return kibanaResponse.ok({
          body: { ok: true, response: { totalDetectors: 0, detectors: [] } },
        });
      }
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  searchResults = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const requestBody = JSON.stringify(request.body);
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.searchResults', {
          body: requestBody,
        });
      return kibanaResponse.ok({
        body: {
          ok: true,
          response,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to search anomaly result', err);
      if (isIndexNotFoundError(err)) {
        return kibanaResponse.ok({
          body: { ok: true, response: { totalDetectors: 0, detectors: [] } },
        });
      }
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  getDetectors = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const {
        from = 0,
        size = 20,
        search = '',
        indices = '',
        sortDirection = SORT_DIRECTION.DESC,
        sortField = 'name',
      } = request.query as GetDetectorsQueryParams;
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
            default_operator: 'AND',
            query: `*${indices.trim().split('-').join('* *')}*`,
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
      const response: any = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.searchDetector', { body: requestBody });

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

      const realtimeDetectors = getRealtimeDetectors(
        Object.values(allDetectors)
      ).reduce(
        (acc: any, detector: any) => ({ ...acc, [detector.id]: detector }),
        {}
      );

      //Given each detector from previous result, get aggregation to power list
      const allDetectorIds = Object.keys(realtimeDetectors);
      const aggregationResult = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.searchResults', {
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
            ...realtimeDetectors[agg.key],
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
            ...realtimeDetectors[unusedDetector],
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
          const detectorStateResp = await this.client
            .asScoped(request)
            .callAsCurrentUser('ad.detectorProfile', {
              detectorId: id,
            });
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
          const detectorResp = await this.client
            .asScoped(request)
            .callAsCurrentUser('ad.getDetector', {
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

      return kibanaResponse.ok({
        body: {
          ok: true,
          response: {
            totalDetectors,
            detectorList: Object.values(finalDetectors),
          },
        },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to search detectors', err);
      if (isIndexNotFoundError(err)) {
        return kibanaResponse.ok({
          body: { ok: true, response: { totalDetectors: 0, detectorList: [] } },
        });
      }
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  getAnomalyResults = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    let { id, isHistorical } = request.params as {
      id: string;
      isHistorical: any;
    };
    isHistorical = JSON.parse(isHistorical);

    // Search by task id if historical, or by detector id if realtime
    const searchTerm = isHistorical ? { task_id: id } : { detector_id: id };

    try {
      const {
        from = 0,
        size = 20,
        sortDirection = SORT_DIRECTION.DESC,
        sortField = AD_DOC_FIELDS.DATA_START_TIME,
        startTime = 0,
        endTime = 0,
        fieldName = '',
        anomalyThreshold = -1,
        entityName = undefined,
        entityValue = undefined,
      } = request.query as {
        from: number;
        size: number;
        sortDirection: SORT_DIRECTION;
        sortField?: string;
        startTime: number;
        endTime: number;
        fieldName: string;
        anomalyThreshold: number;
        entityName: string;
        entityValue: string;
      };

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
                term: searchTerm,
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
        const filterSize = requestBody.query.bool.filter.length;
        if (fieldName) {
          (startTime || endTime) &&
            set(
              requestBody.query.bool.filter,
              `${filterSize}.range.${fieldName}.format`,
              'epoch_millis'
            );

          startTime &&
            set(
              requestBody.query.bool.filter,
              `${filterSize}.range.${fieldName}.gte`,
              startTime
            );

          endTime &&
            set(
              requestBody.query.bool.filter,
              `${filterSize}.range.${fieldName}.lte`,
              endTime
            );
        }
      } catch (error) {
        console.log('wrong date range filter', error);
      }

      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.searchResults', {
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
          features: this.getFeatureData(result),
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
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: {
            totalAnomalies: totalResults,
            results: detectorResult,
            featureResults: featureResult,
          },
        },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to get results', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  matchDetector = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const { detectorName } = request.params as { detectorName: string };
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.matchDetector', {
          detectorName,
        });
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: response,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - matchDetector', err);
      return kibanaResponse.ok({
        body: { ok: false, error: getErrorMessage(err) },
      });
    }
  };

  getDetectorCount = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.detectorCount');
      return kibanaResponse.ok({
        body: {
          ok: true,
          response: response,
        },
      });
    } catch (err) {
      console.log('Anomaly detector - getDetectorCount', err);
      return kibanaResponse.ok({
        body: { ok: false, error: getErrorMessage(err) },
      });
    }
  };

  getFeatureData = (rawResult: any) => {
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

  getHistoricalDetectors = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    try {
      const {
        from = 0,
        size = 20,
        search = '',
        indices = '',
        sortDirection = SORT_DIRECTION.DESC,
        sortField = 'name',
      } = request.query as GetDetectorsQueryParams;
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
            default_operator: 'AND',
            query: `*${indices.trim().split('-').join('* *')}*`,
          },
        });
      }
      // Allowed sorting columns
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
      // Preparing search request
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
      const response: any = await this.client
        .asScoped(request)
        .callAsCurrentUser('ad.searchDetector', { body: requestBody });

      // Get all detectors from search detector API
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

      // Filter out to just include historical detectors
      const allHistoricalDetectors = getHistoricalDetectors(
        Object.values(allDetectors)
      ).reduce(
        (acc, detector: any) => ({ ...acc, [detector.id]: detector }),
        {}
      ) as { [key: string]: Detector };

      // Get related info for each historical detector (detector state, task info, etc.)
      const allIds = Object.values(allHistoricalDetectors).map(
        (detector) => detector.id
      ) as string[];

      const detectorDetailPromises = allIds.map(async (id: string) => {
        try {
          const detectorDetailResp = await this.client
            .asScoped(request)
            .callAsCurrentUser('ad.getDetector', {
              detectorId: id,
            });
          return detectorDetailResp;
        } catch (err) {
          console.log('Error getting historical detector ', err);
          return Promise.reject(
            new Error(
              'Error retrieving all historical detectors: ' +
                getErrorMessage(err)
            )
          );
        }
      });

      const detectorDetailResponses = await Promise.all(
        detectorDetailPromises
      ).catch((err) => {
        throw err;
      });

      // Get the mapping from detector to task
      const detectorTasks = getDetectorTasks(detectorDetailResponses);

      // Get results for each task
      const detectorResultPromises = Object.values(detectorTasks).map(
        async (task) => {
          const taskId = get(task, 'task_id', '');
          try {
            const reqBody = {
              query: {
                bool: {
                  must: [
                    { range: { anomaly_grade: { gt: 0 } } },
                    {
                      term: {
                        task_id: {
                          value: taskId,
                        },
                      },
                    },
                  ],
                },
              },
            };

            const detectorResultResp = await this.client
              .asScoped(request)
              .callAsCurrentUser('ad.searchResults', {
                body: reqBody,
              });
            return detectorResultResp;
          } catch (err) {
            console.log('Error getting historical detector results ', err);
            return Promise.reject(
              new Error(
                'Error retrieving all historical detector results: ' +
                  getErrorMessage(err)
              )
            );
          }
        }
      );

      const detectorResultResponses = await Promise.all(
        detectorResultPromises
      ).catch((err) => {
        throw err;
      });

      // Get the mapping from detector to anomaly results
      const detectorResults = getDetectorResults(detectorResultResponses);

      // Append the task-related info for each detector.
      // If no task: set state to DISABLED and total anomalies to 0
      const detectorsWithTaskInfo = appendTaskInfo(
        allHistoricalDetectors,
        detectorTasks,
        detectorResults
      );

      return kibanaResponse.ok({
        body: {
          ok: true,
          response: {
            totalDetectors: Object.values(detectorsWithTaskInfo).length,
            detectorList: Object.values(detectorsWithTaskInfo),
          },
        },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to search detectors', err);
      if (isIndexNotFoundError(err)) {
        return kibanaResponse.ok({
          body: { ok: true, response: { totalDetectors: 0, detectorList: [] } },
        });
      }
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };
}
