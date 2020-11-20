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
import { schema, TypeOf } from '@kbn/config-schema';
import {
  PluginConfigDescriptor,
  PluginInitializerContext,
} from '../../../src/core/server';
import { AnomalyDetectionKibanaPlugin } from './plugin';

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
});

export type AnomalyDetectionKibanaPluginConfigType = TypeOf<
  typeof configSchema
>;

export const config: PluginConfigDescriptor<AnomalyDetectionKibanaPluginConfigType> = {
  exposeToBrowser: {
    enabled: true,
  },
  schema: configSchema,
};

export interface AnomalyDetectionKibanaPluginSetup {}
export interface AnomalyDetectionKibanaPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new AnomalyDetectionKibanaPlugin(initializerContext);
}
