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
  API_URL_PREFIX,
  SLASH,
  AD_PATH,
  APP_URL_PREFIX,
  AD_URL,
} from './constants';

export const buildAdApiUrl = (apiPath: string): string => {
  return buildServerApiUrl(AD_PATH, apiPath);
};

export const buildServerApiUrl = (appPath: string, apiPath: string): string => {
  return [Cypress.config('baseUrl'), API_URL_PREFIX, appPath, apiPath].join(
    SLASH
  );
};

export const buildAdAppUrl = (pagePath: string): string => {
  return buildAppUrl(AD_URL, pagePath);
};

export const buildAppUrl = (appPath: string, pagePath: string): string => {
  return [APP_URL_PREFIX, appPath, pagePath].join(SLASH);
};
