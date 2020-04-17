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
import { npStart } from 'ui/new_platform';
import { ALERTING_PLUGIN_NAME } from './constants';

export const isInvalid = (name: string, form: any) =>
  !!get(form.touched, name, false) && !!get(form.errors, name, false);

export const isInvalidField = (name: string, form: any) => {
  return !!get(form.touched, name, false) && !!get(form.errors, name, false);
};

export const getError = (name: string, form: any) => get(form.errors, name);

export const required = (val: any): string | undefined => {
  return !val ? 'Required' : undefined;
};

export const requiredNonEmptyArray = (val: any): string | undefined => {
  return !val || val.length === 0 ? 'Required' : undefined;
};

export const validatePositiveInteger = (value: any) => {
  if (!Number.isInteger(value) || value < 1)
    return 'Must be a positive integer';
};

export const validateNonNegativeInteger = (value: any) => {
  if (!Number.isInteger(value) || value < 0)
    return 'Must be a non-negative integer';
};

export const getErrorMessage = (err: any, defaultMessage: string) => {
  if (typeof err === 'string') return err;
  if (err && err.message) return err.message;
  if (isAngularHttpError && isAngularHttpError(err)) return err.data.message;
  return defaultMessage;
};

export const isAlertingInstalled = (): boolean => {
  const navLinks = get(npStart, 'core.chrome.navLinks', undefined);
  if (navLinks) {
    return navLinks.has(ALERTING_PLUGIN_NAME);
  }
  return false;
};

const getPluginRootPath = (url: string, pluginName: string) => {
  return url.slice(0, url.indexOf(pluginName) + pluginName.length);
};

export const getAlertingCreateMonitorLink = (
  detectorId: string,
  detectorName: string,
  detectorInterval: number,
  unit: string
): string => {
  try {
    const navLinks = get(npStart, 'core.chrome.navLinks', undefined);
    const url = `${navLinks.get(ALERTING_PLUGIN_NAME).url}`;
    const alertingRootUrl = getPluginRootPath(url, ALERTING_PLUGIN_NAME);
    return `${alertingRootUrl}#/create-monitor?searchType=ad&adId=${detectorId}&name=${detectorName}&interval=${2 *
      detectorInterval}&unit=${unit}`;
  } catch (e) {
    console.error('unable to get the alerting URL', e);
    return '';
  }
};

export const getAlertingMonitorListLink = (): string => {
  try {
    const navLinks = get(npStart, 'core.chrome.navLinks', undefined);
    const url = `${navLinks.get(ALERTING_PLUGIN_NAME).url}`;
    const alertingRootUrl = getPluginRootPath(url, ALERTING_PLUGIN_NAME);
    return `${alertingRootUrl}#/monitors`;
  } catch (e) {
    console.error('unable to get the alerting URL', e);
    return '';
  }
};

export interface Listener {
  onSuccess(): void;
  onException(): void;
}
