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

import { resolve } from 'path';
import { existsSync } from 'fs';
import { ADPlugin } from './server/plugin';

export default kibana => {
  return new kibana.Plugin({
    require: ['kibana', 'elasticsearch'],
    name: 'opendistro-anomaly-detection',
    uiExports: {
      app: {
        title: 'Open Distro for Elasticsearch Anomaly Detection Kibana plugin',
        description: 'Open Distro for Elasticsearch Anomaly Detection Kibana plugin',
        main: 'plugins/opendistro-anomaly-detection/app',
        icon:
          'plugins/opendistro-anomaly-detection/images/anomaly_detection_icon.svg',
      },
      styleSheetPaths: [
        resolve(__dirname, 'public/app.scss'),
        resolve(__dirname, 'public/app.css'),
      ].find(p => existsSync(p)),
      hacks: [],
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server) {
      // eslint-disable-line no-unused-vars
      // Add server routes and initialize the plugin here
      // This is core shim for the kibana plugins
      const coreSetup = {
        elasticsearch: server.plugins.elasticsearch,
        config: server.config.bind(server),
        http: {
          route: server.route.bind(server),
        },
      };
      // Core server has logging framework we can utilize that once moved to new kibana platform version.
      // https://github.com/elastic/kibana/blob/master/src/core/server/logging/README.md
      const initializerContext = {
        logger: {
          get() {
            return {
              info: log => console.log(log),
              error: log => console.error(log),
              warn: log => console.warn(log),
            };
          },
        },
      };
      // plugins shim
      const pluginsSetup = {};
      new ADPlugin(initializerContext).setup(coreSetup, pluginsSetup);
    },
  });
};
