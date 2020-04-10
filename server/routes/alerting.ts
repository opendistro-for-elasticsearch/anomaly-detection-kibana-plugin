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

import { Request, ResponseToolkit } from 'hapi';
//@ts-ignore
import { get, set } from 'lodash';
//@ts-ignore
import { CallClusterWithRequest } from 'src/legacy/core_plugins/elasticsearch';
import { SearchResponse } from '../models/interfaces';
import { Monitor, ServerResponse } from '../models/types';
import { Router } from '../router';

export default function(apiRouter: Router) {
  apiRouter.post('/monitors/_search', searchMonitors);
}

const searchMonitors = async (
  req: Request,
  h: ResponseToolkit,
  callWithRequest: CallClusterWithRequest
): Promise<ServerResponse<any>> => {
  try {
    const requestBody = {
      query: {
        nested: {
          path: 'monitor.inputs',
          query: {
            bool: {
              must: [
                {
                  term: {
                    'monitor.inputs.search.indices.keyword': {
                      value: '.opendistro-anomaly-results*',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    };
    const response: SearchResponse<Monitor> = await callWithRequest(
      req,
      'alerting.searchMonitors',
      { body: requestBody }
    );
    const totalMonitors = get(response, 'hits.total.value', 0);
    const allMonitors = get(response, 'hits.hits', []).reduce(
      (acc: any, monitor: any) => ({
        ...acc,
        [monitor._id]: {
          id: monitor._id,
          name: get(monitor, '_source.name'),
          enabled: get(monitor, '_source.enabled', false),
          enabledTime: get(monitor, '_source.enabled_time'),
          schedule: get(monitor, '_source.schedule'),
          inputs: get(monitor, '_source.inputs'),
          triggers: get(monitor, '_source.triggers'),
          lastUpdateTime: get(monitor, '_source.last_update_time'),
        },
      }),
      {}
    );

    return {
      ok: true,
      response: {
        totalMonitors,
        monitors: Object.values(allMonitors),
      },
    };
  } catch (err) {
    console.log('Unable to get monitor on top of detector', err);
    return { ok: false, error: err.message };
  }
};
