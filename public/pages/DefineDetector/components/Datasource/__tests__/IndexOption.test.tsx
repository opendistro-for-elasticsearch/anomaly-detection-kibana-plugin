/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { IndexOption } from '../IndexOption';

describe('<IndexOptions /> spec', () => {
  test('renders the component', () => {
    const { container } = render(
      <IndexOption
        option={{ health: 'green', label: 'logstash-1234' }}
        searchValue=""
        contentClassName=""
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders with highlight', () => {
    const { container } = render(
      <IndexOption
        option={{ health: 'green', label: 'logstash-1234' }}
        searchValue="logs"
        contentClassName=""
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
