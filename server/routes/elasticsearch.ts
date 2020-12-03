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

type SearchParams = {
  index: string;
  size: number;
  body: object;
};

export function registerESRoutes(apiRouter: Router, esService: ESService) {
  apiRouter.get('/_indices', esService.getIndices);
  apiRouter.get('/_aliases', esService.getAliases);
  apiRouter.get('/_mappings', esService.getMapping);
  apiRouter.post('/_search', esService.executeSearch);
  apiRouter.put('/create_index', esService.createIndex);
  apiRouter.post('/bulk', esService.bulk);
  apiRouter.post('/delete_index', esService.deleteIndex);
}

export default class ESService {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  executeSearch = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
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

      const results: SearchResponse<any> = await this.client
        .asScoped(request)
        .callAsCurrentUser('search', params);

      return kibanaResponse.ok({ body: { ok: true, response: results } });
    } catch (err) {
      console.error('Anomaly detector - Unable to execute search', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  getIndices = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    const { index } = request.query as { index: string };
    try {
      const response: CatIndex[] = await this.client
        .asScoped(request)
        .callAsCurrentUser('cat.indices', {
          index,
          format: 'json',
          h: 'health,index',
        });
      return kibanaResponse.ok({
        body: { ok: true, response: { indices: response } },
      });
    } catch (err) {
      // In case no matching indices is found it throws an error.
      if (
        err.statusCode === 404 &&
        get<string>(err, 'body.error.type', '') === 'index_not_found_exception'
      ) {
        return kibanaResponse.ok({
          body: { ok: true, response: { indices: [] } },
        });
      }
      console.log('Anomaly detector - Unable to get indices', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  getAliases = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    const { alias } = request.query as { alias: string };
    try {
      const response: IndexAlias[] = await this.client
        .asScoped(request)
        .callAsCurrentUser('cat.aliases', {
          alias,
          format: 'json',
          h: 'alias,index',
        });
      return kibanaResponse.ok({
        body: { ok: true, response: { aliases: response } },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to get aliases', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  createIndex = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    //@ts-ignore
    const index = request.body.index;
    //@ts-ignore
    const body = request.body.body;
    try {
      await this.client.asScoped(request).callAsCurrentUser('indices.create', {
        index: index,
        body: body,
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to create index', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
    try {
      const response: CatIndex[] = await this.client
        .asScoped(request)
        .callAsCurrentUser('cat.indices', {
          index,
          format: 'json',
          h: 'health,index',
        });
      return kibanaResponse.ok({
        body: { ok: true, response: { indices: response } },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to get indices', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  bulk = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    const body = request.body;
    try {
      const response: any = await this.client
        .asScoped(request)
        .callAsCurrentUser('bulk', {
          body: body,
        });
      return kibanaResponse.ok({ body: { ok: true, response: { response } } });
    } catch (err) {
      console.log('Anomaly detector - Unable to perform bulk action', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  deleteIndex = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    const index = request.query as { index: string };
    try {
      await this.client.asScoped(request).callAsCurrentUser('indices.delete', {
        index: index,
      });
    } catch (err) {
      console.log(
        'Anomaly detector - Unable to perform delete index action',
        err
      );
      // Ignore the error if it's an index_not_found_exception
      if (!isIndexNotFoundError(err)) {
        return kibanaResponse.ok({
          body: {
            ok: false,
            error: getErrorMessage(err),
          },
        });
      }
    }
    try {
      const response: CatIndex[] = await this.client
        .asScoped(request)
        .callAsCurrentUser('cat.indices', {
          index,
          format: 'json',
          h: 'health,index',
        });
      return kibanaResponse.ok({
        body: { ok: true, response: { indices: response } },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to get indices', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };

  getMapping = async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    kibanaResponse: KibanaResponseFactory
  ): Promise<IKibanaResponse<any>> => {
    const { index } = request.query as { index: string };
    try {
      const response = await this.client
        .asScoped(request)
        .callAsCurrentUser('indices.getMapping', {
          index,
        });
      return kibanaResponse.ok({
        body: { ok: true, response: { mappings: response } },
      });
    } catch (err) {
      console.log('Anomaly detector - Unable to get mappings', err);
      return kibanaResponse.ok({
        body: {
          ok: false,
          error: getErrorMessage(err),
        },
      });
    }
  };
}
