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

import { API } from '../../utils/constants';

export default function alertingPlugin(Client: any, config: any, components: any) {
  const ca = components.clientAction.factory;

  Client.prototype.alerting = components.clientAction.namespaceFactory();
  const alerting = Client.prototype.alerting.prototype;
  
  alerting.searchMonitors = ca({
    url: {
      fmt: `${API.ALERTING_BASE}/_search`,
    },
    needBody: true,
    method: 'POST',
  });
  
}
