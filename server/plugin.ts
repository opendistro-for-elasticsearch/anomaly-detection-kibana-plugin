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
import { first } from 'rxjs/operators';
import { default as createRouter, Router } from './router';
import {
  AnomalyDetectionKibanaPluginSetup,
  AnomalyDetectionKibanaPluginStart,
} from '.';
import {
  Plugin,
  CoreSetup,
  CoreStart,
  PluginInitializerContext,
  Logger,
} from '../../../src/core/server';
import { ILegacyClusterClient } from '../../../src/core/server/';
import adPlugin from './cluster/ad/adPlugin';
import alertingPlugin from './cluster/ad/alertingPlugin';
import AdService, { registerADRoutes } from './routes/ad';
import AlertingService, { registerAlertingRoutes } from './routes/alerting';
import ESService, { registerESRoutes } from './routes/elasticsearch';
import SampleDataService, {
  registerSampleDataRoutes,
} from './routes/sampleData';
import { DEFAULT_HEADERS } from './utils/constants';

export class AnomalyDetectionKibanaPlugin
  implements
    Plugin<
      AnomalyDetectionKibanaPluginSetup,
      AnomalyDetectionKibanaPluginStart
    > {
  private readonly logger: Logger;
  private readonly globalConfig$: any;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.globalConfig$ = initializerContext.config.legacy.globalConfig$;
  }
  public async setup(core: CoreSetup) {
    // Get any custom/overridden headers
    const globalConfig = await this.globalConfig$.pipe(first()).toPromise();
    const { customHeaders, ...rest } = globalConfig.elasticsearch;

    // Create ES client w/ relevant plugins and headers
    const client: ILegacyClusterClient = core.elasticsearch.legacy.createClient(
      'anomaly_detection',
      {
        plugins: [adPlugin, alertingPlugin],
        customHeaders: { ...customHeaders, ...DEFAULT_HEADERS },
        ...rest,
      }
    );

    // Create router
    const apiRouter: Router = createRouter(
      core.http.createRouter(),
      BASE_NODE_API_PATH
    );

    // Create services & register with ES client
    const adService = new AdService(client);
    const alertingService = new AlertingService(client);
    const esService = new ESService(client);
    const sampleDataService = new SampleDataService(client);

    // Register server routes with the service
    registerADRoutes(apiRouter, adService);
    registerAlertingRoutes(apiRouter, alertingService);
    registerESRoutes(apiRouter, esService);
    registerSampleDataRoutes(apiRouter, sampleDataService);

    return {};
  }

  public async start(core: CoreStart) {
    return {};
  }
}
