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
import { BASE_NODE_API_PATH } from '../utils/constants';
import { default as createRouter, Router } from './router';
import registerADRoutes from './routes/ad';
import registerAlertingRoutes from './routes/alerting';
import registerElasticsearchRoute from './routes/elasticsearch';
import registerSampleDataRoutes from './routes/sampleData';
import {
  AnomalyDetectionKibanaPluginSetup,
  AnomalyDetectionKibanaPluginStart,
} from '.';
import { Plugin, CoreSetup, CoreStart } from '../../../src/core/server';

export class AnomalyDetectionKibanaPlugin
  implements
    Plugin<
      AnomalyDetectionKibanaPluginSetup,
      AnomalyDetectionKibanaPluginStart
    > {
  public async setup(core: CoreSetup) {
    // Create router
    const apiRouter: Router = createRouter(
      core.http,
      BASE_NODE_API_PATH,
      core.elasticsearch
    );
    // Add server routes
    registerElasticsearchRoute(apiRouter);
    registerADRoutes(apiRouter);
    registerAlertingRoutes(apiRouter);
    registerSampleDataRoutes(apiRouter);
    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
