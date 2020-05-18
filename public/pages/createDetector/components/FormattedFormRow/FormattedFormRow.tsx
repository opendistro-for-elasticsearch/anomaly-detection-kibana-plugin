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

import React, { ReactElement, ReactNode } from 'react';
import { EuiFormRow } from '@elastic/eui';

type FormattedFormRowProps = {
  title?: string;
  formattedTitle?: ReactNode;
  children: ReactElement;
  hint?: string | string[];
  isInvalid?: boolean;
  error?: ReactNode | ReactNode[];
  fullWidth?: boolean;
  helpText?: string;
};

export const FormattedFormRow = (props: FormattedFormRowProps) => {
  let hints;
  if (props.hint) {
    const hintTexts = Array.isArray(props.hint) ? props.hint : [props.hint];
    hints = hintTexts.map((hint, i) => {
      return <p key={i} className="sublabel">{hint}</p>;
    });
  }
  const {formattedTitle, ...euiFormRowProps} = props;

  return (
    <EuiFormRow
      label={
        <div style={{ lineHeight: '8px' }}>
          {formattedTitle ? formattedTitle : <p>{props.title}</p>}
          <br />
          {hints}
        </div>
      }
      {...euiFormRowProps}
    >
      {props.children}
    </EuiFormRow>
  );
};
