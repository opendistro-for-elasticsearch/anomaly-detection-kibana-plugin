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
  IRouter,
  RequestHandlerContext,
  KibanaRequest,
  KibanaResponseFactory,
  IKibanaResponse,
} from '../../../src/core/server';
import { schema } from '@kbn/config-schema';

type RouteHandler = (
  context: RequestHandlerContext,
  request: KibanaRequest,
  response: KibanaResponseFactory
) => Promise<IKibanaResponse<any>>;

type Route = (path: string, handler: RouteHandler) => Router;

export interface Router {
  get: Route;
  post: Route;
  put: Route;
  delete: Route;
}
// Router factory
export default (iRouter: IRouter, basePath: String): Router => {
  if (basePath == null || basePath == '') {
    throw new TypeError('Base path is null');
  }
  const requestHandler = (handler: RouteHandler) => async (
    context: RequestHandlerContext,
    request: KibanaRequest,
    response: KibanaResponseFactory
  ) => {
    try {
      return await handler(context, request, response);
    } catch (e) {
      throw e;
    }
  };
  return ['get', 'put', 'post', 'delete'].reduce(
    (router: any, method: string) => {
      router[method] = (path: String, handler: RouteHandler) => {
        switch (method) {
          case 'get': {
            iRouter.get(
              {
                path: `${basePath}${path}`,
                validate: {
                  params: schema.any(),
                  query: schema.any(),
                  body: schema.any(),
                },
              },
              requestHandler(handler)
            );
            break;
          }
          case 'put': {
            iRouter.put(
              {
                path: `${basePath}${path}`,
                validate: {
                  params: schema.any(),
                  query: schema.any(),
                  body: schema.any(),
                },
              },
              requestHandler(handler)
            );
            break;
          }
          case 'post': {
            iRouter.post(
              {
                path: `${basePath}${path}`,
                validate: {
                  params: schema.any(),
                  query: schema.any(),
                  body: schema.any(),
                },
              },
              requestHandler(handler)
            );
            break;
          }
          case 'delete': {
            iRouter.delete(
              {
                path: `${basePath}${path}`,
                validate: {
                  params: schema.any(),
                  query: schema.any(),
                  body: schema.any(),
                },
              },
              requestHandler(handler)
            );
            break;
          }
          default: {
            break;
          }
        }
      };
      return router;
    },
    {}
  );
};
