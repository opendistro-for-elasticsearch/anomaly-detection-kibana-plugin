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
import { CLUSTER } from './utils/constants';
//TODO: Fix types
// import { CallClusterWithRequest, ElasticsearchPlugin } from '../../../kibana/src/legacy/core_plugins/elasticsearch/index'

type RouteHandler = (
  req: Request,
  responseToolkit: ResponseToolkit,
  callWithRequest: any
) => Promise<any>;

type Route = (path: string, handler: RouteHandler) => Router;

export interface Router {
  get: Route;
  post: Route;
  put: Route;
  delete: Route;
}
// Router factory
export default (server: any, basePath: String, elasticsearch: any): Router => {
  if (basePath == null || basePath == '') {
    throw new TypeError('Base path is null');
  }
  const requestHandler = (handler: RouteHandler) => async (
    req: Request,
    h: ResponseToolkit
  ) => {
    try {
      //TODO :: See, if we need to pass on entire cluster or not.
      const callWithRequest = elasticsearch.getCluster(CLUSTER.AES_AD)
        .callWithRequest;
      return await handler(req, h, callWithRequest);
    } catch (e) {
      throw e;
    }
  };
  return ['get', 'put', 'post', 'delete'].reduce(
    (router: any, method: string) => {
      router[method] = (path: String, handler: RouteHandler) => {
        server.route({
          path: `${basePath}${path}`,
          method: method.toUpperCase(),
          handler: requestHandler(handler),
        });
      };
      return router;
    },
    {}
  );
};
