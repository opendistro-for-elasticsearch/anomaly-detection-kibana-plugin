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

import { get } from 'lodash';
//@ts-ignore
import { isAngularHttpError } from 'ui/notify/lib/format_angular_http_error';
//@ts-ignore
import { getNewPlatform } from 'ui/new_platform';
import { ALERTING_PLUGIN_NAME } from './constants';

export const isInvalid = (name: string, form: any) =>
  !!get(form.touched, name, false) && !!get(form.errors, name, false);

export const getError = (name: string, form: any) => get(form.errors, name);

export const required = (val: any): string | undefined => {
  return !val ? 'Required' : undefined;
};

export const validatePositiveInteger = (value: any) => {
  if (!Number.isInteger(value) || value < 1)
    return 'Must be a positive integer';
};

export const getErrorMessage = (err: any, defaultMessage: string) => {
  if (typeof err === 'string') return err;
  if (err && err.message) return err.message;
  if (isAngularHttpError && isAngularHttpError(err)) return err.data.message;
  return defaultMessage;
};

export const isAlertingInstalled = (): boolean => {
  const navLinks = get(
    getNewPlatform(),
    'start.core.chrome.navLinks',
    undefined
  );
  if (navLinks) {
    return navLinks.has(ALERTING_PLUGIN_NAME);
  }
  return false;
};

export const getAlertingCreateMonitorLink = (
  detectorId: string,
  detectorName: string
): string => {
  try {
    const navLinks = get(
      getNewPlatform(),
      'start.core.chrome.navLinks',
      undefined
    );
    return `${
      navLinks.get(ALERTING_PLUGIN_NAME).url
    }#/create-monitor?searchType=ad&adId=${detectorId}&name=${detectorName}`;
  } catch (e) {
    //Not installed
    console.error('unable to get the alerting URL', e);
    return '';
  }
};

export const getAlertingMonitorListLink = (): string => {
  try {
    const navLinks = get(
      getNewPlatform(),
      'start.core.chrome.navLinks',
      undefined
    );
    return `${navLinks.get(ALERTING_PLUGIN_NAME).url}#/monitors`;
  } catch (e) {
    //Not installed
    console.error('unable to get the alerting URL', e);
    return '';
  }
};
