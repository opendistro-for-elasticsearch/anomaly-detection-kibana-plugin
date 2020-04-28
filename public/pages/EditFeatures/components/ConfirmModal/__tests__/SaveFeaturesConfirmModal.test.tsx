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

import React from 'react';
import { render } from '@testing-library/react';
import { SaveFeaturesConfirmModal } from '../SaveFeaturesConfirmModal';
import { SAVE_FEATURE_OPTIONS } from '../../../../EditFeatures/utils/constants';


describe('<SaveFeaturesConfirmModal /> spec', () => {
  test('renders the component with ready to start job', () => {
    const { container } = render(
      <SaveFeaturesConfirmModal
        readyToStartAdJob={true}
        saveFeatureOption={SAVE_FEATURE_OPTIONS.START_AD_JOB}
        onClose={jest.fn()}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        onOptionChange={jest.fn()}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
  
});
