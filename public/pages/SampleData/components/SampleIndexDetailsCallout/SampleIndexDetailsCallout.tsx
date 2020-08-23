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
import { EuiCallOut, EuiLink } from '@elastic/eui';
import { KIBANA_NAME, KIBANA_PATH } from '../../../../utils/constants';

interface SampleIndexDetailsCalloutProps {
  indexName: string;
}

export const SampleIndexDetailsCallout = (
  props: SampleIndexDetailsCalloutProps
) => {
  return (
    <EuiCallOut
      title="Want more details on the sample data?"
      color="primary"
      iconType="help"
    >
      <p>
        Check out the{' '}
        <EuiLink
          href={`${KIBANA_NAME}#${KIBANA_PATH.DISCOVER}`}
          target="_blank"
        >
          Kibana Discover app
        </EuiLink>
        {''} to view the raw data for sample index '{props.indexName}'.
      </p>
    </EuiCallOut>
  );
};
