/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { get } from 'lodash';
import { SearchResponse } from '../models/interfaces';
import {
  CatIndex,
  GetAliasesResponse,
  GetIndicesResponse,
  GetMappingResponse,
  IndexAlias,
  ServerResponse,
} from '../models/types';
import { Router } from '../router';
import { getErrorMessage, isIndexNotFoundError } from './utils/adHelpers';
import {
  RequestHandlerContext,
  KibanaRequest,
  KibanaResponseFactory,
  IKibanaResponse,
} from '../../../../src/core/server';

export default function (apiRouter: Router) {
  apiRouter.get('/_indices', getIndices);
  apiRouter.get('/_aliases', getAliases);
  apiRouter.get('/_mappings', getMapping);
  apiRouter.post('/_search', executeSearch);
  apiRouter.put('/create_index', createIndex);
  apiRouter.post('/bulk', bulk);
  apiRouter.post('/delete_index', deleteIndex);
}

type SearchParams = {
  index: string;
  size: number;
  body: object;
};

const executeSearch = async (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
): Promise<ServerResponse<SearchResponse<any>>> => {
  try {
    const {
      index,
      query,
      size = 0,
      sort = undefined,
      collapse = undefined,
      aggs = undefined,
      rawQuery = undefined,
    } = request.body as {
      index: string;
      query?: object;
      size?: number;
      sort?: object;
      collapse?: object;
      aggs?: object;
      rawQuery: object;
    };
    const requestBody = rawQuery
      ? rawQuery
      : {
          query: query,
          ...(sort !== undefined && { sort: sort }),
          ...(collapse !== undefined && { collapse: collapse }),
          ...(aggs !== undefined && { aggs: aggs }),
        };

    const params: SearchParams = { index, size, body: requestBody };

    const results: SearchResponse<any> = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'search',
      params
    );

    return { ok: true, response: results };
  } catch (err) {
    console.error('Anomaly detector - Unable to execute search', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const getIndices = async (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
): Promise<ServerResponse<GetIndicesResponse>> => {
  const { index } = request.query as { index: string };
  try {
    const response: CatIndex[] = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'cat.indices',
      {
        index,
        format: 'json',
        h: 'health,index',
      }
    );
    return { ok: true, response: { indices: response } };
  } catch (err) {
    // In case no matching indices is found it throws an error.
    if (
      err.statusCode === 404 &&
      get<string>(err, 'body.error.type', '') === 'index_not_found_exception'
    ) {
      return { ok: true, response: { indices: [] } };
    }
    console.log('Anomaly detector - Unable to get indices', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const getAliases = async (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
): Promise<ServerResponse<GetAliasesResponse>> => {
  const { alias } = request.query as { alias: string };
  try {
    const response: IndexAlias[] = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'cat.aliases',
      {
        alias,
        format: 'json',
        h: 'alias,index',
      }
    );
    return { ok: true, response: { aliases: response } };
  } catch (err) {
    console.log('Anomaly detector - Unable to get aliases', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const createIndex = async (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
): Promise<ServerResponse<any>> => {
  //@ts-ignore
  const index = request.body.indexConfig.index;
  //@ts-ignore
  const body = request.body.indexConfig.body;
  try {
    await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      req,
      'indices.create',
      {
        index: index,
        body: body,
      }
    );
  } catch (err) {
    console.log('Anomaly detector - Unable to create index', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
  try {
    const response: CatIndex[] = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'cat.indices',
      {
        index,
        format: 'json',
        h: 'health,index',
      }
    );
    return { ok: true, response: { indices: response } };
  } catch (err) {
    console.log('Anomaly detector - Unable to get indices', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const bulk = async (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
): Promise<ServerResponse<GetAliasesResponse>> => {
  //@ts-ignore
  const body = request.body.body;
  try {
    const response: any = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'bulk',
      {
        body: body,
      }
    );
    //@ts-ignore
    return { ok: true, response: { response } };
  } catch (err) {
    console.log('Anomaly detector - Unable to perform bulk action', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const deleteIndex = async (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
): Promise<ServerResponse<any>> => {
  //@ts-ignore
  const index = request.body.index;
  try {
    await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'indices.delete',
      {
        index: index,
      }
    );
  } catch (err) {
    console.log(
      'Anomaly detector - Unable to perform delete index action',
      err
    );
    // Ignore the error if it's an index_not_found_exception
    if (!isIndexNotFoundError(err)) {
      return {
        ok: false,
        error: getErrorMessage(err),
      };
    }
  }
  try {
    const response: CatIndex[] = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'cat.indices',
      {
        index,
        format: 'json',
        h: 'health,index',
      }
    );
    return { ok: true, response: { indices: response } };
  } catch (err) {
    console.log('Anomaly detector - Unable to get indices', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};

const getMapping = async (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
): Promise<ServerResponse<GetMappingResponse>> => {
  const { index } = request.query as { index: string };
  try {
    const response = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
      'indices.getMapping',
      {
        index,
      }
    );
    return { ok: true, response: { mappings: response } };
  } catch (err) {
    console.log('Anomaly detector - Unable to get mappings', err);
    return {
      ok: false,
      error: getErrorMessage(err),
    };
  }
};
