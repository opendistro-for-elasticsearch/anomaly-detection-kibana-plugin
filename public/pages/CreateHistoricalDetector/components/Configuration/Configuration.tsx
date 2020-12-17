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

import { EuiSpacer } from '@elastic/eui';
import { FormikProps } from 'formik';
import React from 'react';
import ContentPanel from '../../../../components/ContentPanel/ContentPanel';
import { Detector } from '../../../../models/interfaces';
import {
  HistoricalDetectorFormikValues,
  SAVE_HISTORICAL_DETECTOR_OPTIONS,
} from '../../utils/constants';
import { Timestamp } from './components/Timestamp/Timestamp';
import { Features } from './components/Features/Features';
import { OperationSettings } from './components/OperationSettings/OperationSettings';
import { ExistingDetectors } from './components/ExistingDetectors/ExistingDetectors';

interface ConfigurationProps {
  isEdit: boolean;
  detector: Detector;
  isLoading: boolean;
  formikProps: FormikProps<HistoricalDetectorFormikValues>;
  selectedSaveOption: SAVE_HISTORICAL_DETECTOR_OPTIONS;
  onSaveOptionChange(id: string): void;
}

export function Configuration(props: ConfigurationProps) {
  return (
    <ContentPanel title="Detector settings" titleSize="s">
      {!props.isEdit ? (
        <ExistingDetectors formikProps={props.formikProps} />
      ) : null}
      <Timestamp formikProps={props.formikProps} />
      <EuiSpacer size="l" />
      <Features
        detector={props.detector}
        formikProps={props.formikProps}
        isLoading={props.isLoading}
      />
      <EuiSpacer size="l" />
      <OperationSettings
        formikProps={props.formikProps}
        selectedOption={props.selectedSaveOption}
        onOptionChange={props.onSaveOptionChange}
      />
    </ContentPanel>
  );
}
