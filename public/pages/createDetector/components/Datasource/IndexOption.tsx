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

//@ts-ignore
import { EuiHealth, EuiHighlight } from '@elastic/eui';
import React from 'react';
import { customSuccessColor, customWarningColor, customDangerColor, customSubduedColor } from '../../../utils/constants';

type IndexOptionProps = {
  option: any;
  searchValue: string;
  contentClassName: string;
};

const healthToColor = {
  green: customSuccessColor,
  yellow: customWarningColor,
  red: customDangerColor,
  undefined: customSubduedColor,
} as { [key: string]: string };

function IndexOption({
  option,
  searchValue,
  contentClassName,
}: IndexOptionProps) {
  const { health, label, index } = option;
  const isAlias = !!index;

  const color = healthToColor[health];
  return (
    <EuiHealth color={color}>
      <span className={contentClassName}>
        <EuiHighlight search={searchValue}>{label}</EuiHighlight>
        {isAlias && (
          <span>
            &nbsp;(
            {index})
          </span>
        )}
      </span>
    </EuiHealth>
  );
}

export { IndexOption };
