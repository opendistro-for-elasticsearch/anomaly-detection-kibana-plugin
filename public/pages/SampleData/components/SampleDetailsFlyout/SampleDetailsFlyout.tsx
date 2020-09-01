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

import React from 'react';
import { get } from 'lodash';
import {
  EuiAccordion,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiText,
  EuiTitle,
  EuiSpacer,
} from '@elastic/eui';
import {
  getFieldsAndTypesGrid,
  getFeaturesAndAggsAndFieldsGrid,
} from '../../utils/helpers';
import { SAMPLE_DATA } from '../../utils/constants';
import { EuiHorizontalRule } from '@elastic/eui';

interface SampleDetailsFlyoutProps {
  title: string;
  sampleData: SAMPLE_DATA;
  interval: number;
  onClose(): void;
}

export const SampleDetailsFlyout = (props: SampleDetailsFlyoutProps) => {
  const fieldValues = Object.keys(props.sampleData.fieldMappings);
  const fieldTypes = fieldValues.map((field) =>
    get(props.sampleData.fieldMappings, `${field}.type`)
  );
  const featureNames = Object.keys(
    get(props.sampleData.detectorConfig, 'uiMetadata.features')
  );
  const featureAggs = featureNames.map((feature) =>
    get(
      props.sampleData.detectorConfig,
      `uiMetadata.features.${feature}.aggregationBy`
    )
  );
  const featureFields = featureNames.map((feature) =>
    get(
      props.sampleData.detectorConfig,
      `uiMetadata.features.${feature}.aggregationOf`
    )
  );
  const detectorInterval = get(
    props.sampleData.detectorConfig,
    'detection_interval.period.interval'
  );

  return (
    <EuiFlyout
      ownFocus={false}
      onClose={props.onClose}
      aria-labelledby="flyoutTitle"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2 id="flyoutTitle">{props.title}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiAccordion
          id="detectorDetailsAccordion"
          buttonContent={
            <EuiTitle size="s">
              <h3>Detector details</h3>
            </EuiTitle>
          }
          initialIsOpen={true}
          paddingSize="m"
        >
          <EuiText style={{ lineHeight: 2.0 }}>
            <b>Name: </b>
            <i>{props.sampleData.detectorName}</i>
            <br></br>
            <b>Detection interval: </b>
            Every {detectorInterval} minutes
            <br></br>
            <b>Feature details: </b>
          </EuiText>
          <EuiSpacer size="s" />
          {getFeaturesAndAggsAndFieldsGrid(
            featureNames,
            featureAggs,
            featureFields
          )}
        </EuiAccordion>
        <EuiHorizontalRule margin="m" />
        <EuiAccordion
          id="indexDetailsAccordion"
          buttonContent={
            <EuiTitle size="s">
              <h3>Index details</h3>
            </EuiTitle>
          }
          initialIsOpen={false}
          paddingSize="m"
        >
          <EuiText style={{ lineHeight: 2.0 }}>
            <b>Name: </b>
            <i>{props.sampleData.indexName}</i>
            <br></br>
            <b>Log frequency: </b>Every {props.interval} minute(s)
            <br></br>
            <b>Log duration: </b>3 weeks
            <br></br>
            <b>Field details: </b>
          </EuiText>
          <EuiSpacer size="s" />
          {getFieldsAndTypesGrid(fieldValues, fieldTypes)}
        </EuiAccordion>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
