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

import { Request, ResponseToolkit } from 'hapi';
import { get } from 'lodash';
//@ts-ignore
import { CallClusterWithRequest } from 'src/legacy/core_plugins/elasticsearch';
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

export default function(apiRouter: Router) {
  apiRouter.get('/_indices', getIndices);
  apiRouter.get('/_aliases', getAliases);
  apiRouter.get('/_mappings', getMapping);
  apiRouter.post('/_search', executeSearch);
}

type SearchParams = {
  index: string;
  size: number;
  body: object;
};

const executeSearch = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<SearchResponse<any>>> => {
  try {
    const { query, index, size = 0 } = req.payload as {
      query: object;
      index: string;
      size?: number;
    };
    const params: SearchParams = { index, size, body: query };
    const results: SearchResponse<any> = await callWithRequest(
      req,
      'search',
      params
    );
    return { ok: true, response: results };
  } catch (err) {
    console.error('Anomaly detector - Unable to execute search', err);
    return { ok: false, error: err.message };
  }
};

const getIndices = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<GetIndicesResponse>> => {
  const { index } = req.query as { index: string };
  try {
    const response: CatIndex[] = await callWithRequest(req, 'cat.indices', {
      index,
      format: 'json',
      h: 'health,index',
    });
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
    return { ok: false, error: err.message };
  }
};

const getAliases = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<GetAliasesResponse>> => {
  const { alias } = req.query as { alias: string };
  try {
    const response: IndexAlias[] = await callWithRequest(req, 'cat.aliases', {
      alias,
      format: 'json',
      h: 'alias,index',
    });
    return { ok: true, response: { aliases: response } };
  } catch (err) {
    console.log('Anomaly detector - Unable to get aliases', err);
    return { ok: false, error: err.message };
  }
};

const getMapping = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<GetMappingResponse>> => {
  const { index } = req.query as { index: string };
  try {
    const response = await callWithRequest(req, 'indices.getMapping', {
      index,
    });
    return { ok: true, response: { mappings: response } };
  } catch (err) {
    console.log('Anomaly detector - Unable to get mappings', err);
    return { ok: false, error: err.message };
  }
};
