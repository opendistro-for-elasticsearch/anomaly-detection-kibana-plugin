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
import { darkModeEnabled } from '../utils/kibanaUtils';
import { ALERTING_PLUGIN_NAME, NAME_REGEX } from './constants';
import { MAX_FEATURE_NAME_SIZE } from './constants';
import { CoreStart } from '../../../../src/core/public';
import { CoreServicesContext } from '../components/CoreServices/CoreServices';
import datemath from '@elastic/datemath';
import moment from 'moment';

export const validateFeatureName = (
  featureName: string
): string | undefined => {
  return validateName(featureName, 'feature');
};

export const validateDetectorName = (
  detectorName: string
): string | undefined => {
  return validateName(detectorName, 'detector');
};

export const validateName = (
  name: string,
  fieldName: string
): string | undefined => {
  if (isEmpty(name)) {
    return `You must enter a ${fieldName} name`;
  }
  if (name.length > MAX_FEATURE_NAME_SIZE) {
    return `Name is too big maximum limit is ${MAX_FEATURE_NAME_SIZE}`;
  }
  if (!NAME_REGEX.test(name)) {
    return 'Valid characters are a-z, A-Z, 0-9, -(hyphen) and _(underscore)';
  }
};

export const isInvalid = (name: string, form: any) =>
  !!get(form.touched, name, false) && !!get(form.errors, name, false);

export const getError = (name: string, form: any) => get(form.errors, name);

export const requiredSelectField = (val: any): string | undefined => {
  return required(val, 'You must select a field');
};

export const required = (
  val: any,
  customErrorMessage?: string
): string | undefined => {
  // if val is number, skip check as number value already exists
  const message = !isEmpty(customErrorMessage)
    ? customErrorMessage
    : 'Required';
  return typeof val !== 'number' && !val ? message : undefined;
};

export const requiredNonEmptyArray = (
  val: any,
  customErrorMessage?: string
): string | undefined => {
  const message = !isEmpty(customErrorMessage)
    ? customErrorMessage
    : 'Required';
  return !val || val.length === 0 ? message : undefined;
};

export const requiredNonEmptyFieldSelected = (val: any): string | undefined => {
  return requiredNonEmptyArray(val, 'You must select a field');
};

export const validateCategoryField = (val: any): string | undefined => {
  return requiredNonEmptyArray(val, 'You must select a category field');
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
  return defaultMessage;
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
    const core = React.useContext(CoreServicesContext) as CoreStart;
    const navLinks = get(core, 'chrome.navLinks', undefined);
    const url = `${navLinks.get(ALERTING_PLUGIN_NAME).url}`;
    const alertingRootUrl = getPluginRootPath(url, ALERTING_PLUGIN_NAME);
    return `${alertingRootUrl}#/create-monitor?searchType=ad&adId=${detectorId}&name=${detectorName}&interval=${
      2 * detectorInterval
    }&unit=${unit}`;
  } catch (e) {
    console.error('unable to get the alerting URL', e);
    return '';
  }
};

export const getAlertingMonitorListLink = (): string => {
  try {
    const core = React.useContext(CoreServicesContext) as CoreStart;
    const navLinks = get(core, 'chrome.navLinks', undefined);
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

const detectorCountFontColor = () =>
  darkModeEnabled() ? '#98A2B3' : '#535966';

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
        <p style={{ color: detectorCountFontColor() }}>{`(${count})`}</p>
      </h3>
    </EuiTitle>
  );
};

export function convertTimestampToString(timestamp: number | string) {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return moment(timestamp).format('MM/DD/YYYY hh:mm A');
}

export function convertTimestampToNumber(timestamp: number | string) {
  if (typeof timestamp === 'string') {
    return datemath.parse(timestamp)?.valueOf();
  }
  return timestamp;
}
