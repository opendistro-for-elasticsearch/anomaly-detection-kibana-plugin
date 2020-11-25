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
  AppMountParameters,
  CoreSetup,
  CoreStart,
  Plugin,
  PluginInitializerContext,
} from '../../../src/core/public';
import {
  AnomalyDetectionKibanaPluginSetup,
  AnomalyDetectionKibanaPluginStart,
} from '.';

export class AnomalyDetectionKibanaPlugin
  implements
    Plugin<
      AnomalyDetectionKibanaPluginSetup,
      AnomalyDetectionKibanaPluginStart
    > {
  constructor(private readonly initializerContext: PluginInitializerContext) {
    // can retrieve config from initializerContext
  }

  public setup(core: CoreSetup): AnomalyDetectionKibanaPluginSetup {
    core.application.register({
      id: 'opendistro-anomaly-detection-kibana',
      title: 'Anomaly Detection',
      category: {
        id: 'odfe',
        label: 'Open Distro for Elasticsearch',
        euiIconType: 'logoKibana',
        order: 2000,
      },
      order: 5000,
      mount: async (params: AppMountParameters) => {
        const { renderApp } = await import('./anomaly_detection_app');
        const [coreStart, depsStart] = await core.getStartServices();
        return renderApp(coreStart, params);
      },
    });
    return {};
  }

  public start(core: CoreStart): AnomalyDetectionKibanaPluginStart {
    return {};
  }
}
