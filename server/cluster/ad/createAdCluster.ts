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
import { Legacy } from 'kibana';
import { CLUSTER, DEFAULT_HEADERS } from '../../utils/constants';
import adPlugin from './adPlugin';

export default function createAdCluster(
  elasticsearch: Legacy.Plugins.elasticsearch.Plugin.ESPlugin,
  config: any
) {
  // Ideally this is kibanaConfig just acting weird
  const { customHeaders, ...rest } = config().get('elasticsearch');
  elasticsearch.createCluster(CLUSTER.AES_AD, {
    plugins: [adPlugin],
    customHeaders: { ...customHeaders, ...DEFAULT_HEADERS },
    ...rest,
  });
}
