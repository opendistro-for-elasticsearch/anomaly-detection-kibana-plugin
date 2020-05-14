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

import { get, isEmpty } from 'lodash';
import React from 'react';
import { EuiTitle } from '@elastic/eui';
//@ts-ignore
import { isAngularHttpError } from 'ui/notify';
//@ts-ignore
import { npStart } from 'ui/new_platform';
import { darkModeEnabled } from '../utils/kibanaUtils';
import { ALERTING_PLUGIN_NAME, NAME_REGEX } from './constants';
import { MAX_FEATURE_NAME_SIZE } from './constants';

export const validateName = (featureName: string): string | undefined => {
  if (isEmpty(featureName)) {
    return 'Required';
  }
  if (featureName.length > MAX_FEATURE_NAME_SIZE) {
    return `Name is too big maximum limit is ${MAX_FEATURE_NAME_SIZE}`;
  }
  if (!NAME_REGEX.test(featureName)) {
    return 'Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)';
  }
};

export const isInvalid = (name: string, form: any) =>
  !!get(form.touched, name, false) && !!get(form.errors, name, false);

export const getError = (name: string, form: any) => get(form.errors, name);

export const required = (val: any): string | undefined => {
  // if val is number, skip check as number value already exists
  return typeof val !== 'number' && !val ? 'Required' : undefined;
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

const detectorCountFontColor = darkModeEnabled() ? '#98A2B3' : '#535966';

export const getTitleWithCount = (title: string, count: number | string) => {
  return (
    <EuiTitle size={'s'} className={''}>
      <h3
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <p>{title}&nbsp;</p>
        <p style={{ color: detectorCountFontColor }}>{`(${count})`}</p>
      </h3>
    </EuiTitle>
  );
};
