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

import { get } from 'lodash';
import {
  HistoricalDetectorFormikValues,
  INITIAL_HISTORICAL_DETECTOR_VALUES,
} from '../../../../../utils/constants';
import { FormikProps } from 'formik';
import { Detector } from '../../../../../../../models/interfaces';
import { generateInitialFeatures } from '../../../../../../EditFeatures/utils/helpers';

export function populateDetectorFieldsFromDetector(
  formikProps: FormikProps<HistoricalDetectorFormikValues>,
  detector: Detector
) {
  formikProps.setFieldValue('timeField', detector.timeField);
  formikProps.setFieldValue('featureList', generateInitialFeatures(detector));
  formikProps.setFieldValue(
    'detectionInterval',
    get(detector, 'detectionInterval.period.interval')
  );
}

export function populateDetectorFieldsToInitialValues(
  formikProps: FormikProps<HistoricalDetectorFormikValues>
) {
  formikProps.setFieldValue(
    'timeField',
    INITIAL_HISTORICAL_DETECTOR_VALUES.timeField
  );
  formikProps.setFieldValue(
    'featureList',
    INITIAL_HISTORICAL_DETECTOR_VALUES.featureList
  );
  formikProps.setFieldValue(
    'detectionInterval',
    INITIAL_HISTORICAL_DETECTOR_VALUES.detectionInterval
  );
}

export function untouchDetectorFields(
  formikProps: FormikProps<HistoricalDetectorFormikValues>
) {
  formikProps.setFieldTouched('timeField', false);
  formikProps.setFieldTouched('featureList', false);
  formikProps.setFieldTouched('detectionInterval', false);
}
