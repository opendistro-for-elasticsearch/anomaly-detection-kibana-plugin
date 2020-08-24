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

import { DataTypes, Mappings } from './elasticsearch';

export function shouldSkip(mapping: any) {
  const isDisabled = mapping.enabled === false;
  const hasIndexDisabled = mapping.index === false;
  const isNestedDataType = mapping.type === 'nested';
  return isDisabled || hasIndexDisabled || isNestedDataType;
}

export function resolvePath(path: string, field: string): string {
  if (path) return `${path}.${field}`;
  return field;
}

export function getTypeFromMappings(
  mappings: Mappings,
  dataTypes: DataTypes,
  path = ''
): DataTypes {
  let currentDataTypes = { ...dataTypes };
  if (shouldSkip(mappings)) return currentDataTypes;

  if (mappings.properties) {
    Object.entries(mappings.properties).forEach(([field, value]) => {
      currentDataTypes = getTypeFromMappings(
        value as Mappings,
        currentDataTypes,
        resolvePath(path, field)
      );
    });
    return currentDataTypes;
  }
  const type = mappings.type;

  if (currentDataTypes[type]) {
    if (currentDataTypes[type].indexOf(path) === -1) {
      currentDataTypes[type].push(path);
    }
  } else {
    currentDataTypes[type] = [path];
  }

  if (mappings.fields) {
    Object.entries(mappings.fields).forEach(([field, value]) => {
      currentDataTypes = getTypeFromMappings(
        value as Mappings,
        currentDataTypes,
        resolvePath(path, field)
      );
    });
  }

  return currentDataTypes;
}

export function getPathsPerDataType(mappings: Mappings): DataTypes {
  let dataTypesPath: DataTypes = {};
  Object.entries(mappings).forEach(([index, { mappings: docMappings }]) => {
    dataTypesPath = getTypeFromMappings(docMappings, dataTypesPath);
  });
  return dataTypesPath;
}
