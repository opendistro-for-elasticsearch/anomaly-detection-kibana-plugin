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

//@ts-ignore
import { Legacy, Logger, PluginInitializerContext, PluginName } from 'kibana';
import { BASE_NODE_API_PATH } from '../utils/constants';
import { createAdCluster } from './cluster';
import { default as createRouter, Router } from './router';
import registerADRoutes from './routes/ad';
import registerAlertingRoutes from './routes/alerting';
import registerElasticsearchRoute from './routes/elasticsearch';
import registerSampleDataRoutes from './routes/sampleData';

interface CoreSetup {
  elasticsearch: Legacy.Plugins.elasticsearch.Plugin;
  http: Legacy.Server;
  config: Legacy.KibanaConfig;
}

export class ADPlugin {
  private readonly log: Logger;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.log = this.initializerContext.logger.get();
  }

  public setup(core: CoreSetup, deps: Record<PluginName, unknown>) {
    this.log.info(`Setting up AD with core contract`);
    createAdCluster(core.elasticsearch, core.config);
    const apiRouter: Router = createRouter(
      core.http,
      BASE_NODE_API_PATH,
      core.elasticsearch
    );
    registerElasticsearchRoute(apiRouter);
    registerADRoutes(apiRouter);
    registerAlertingRoutes(apiRouter);
    registerSampleDataRoutes(apiRouter);
  }

  public start() {}
  public stop() {}
}
