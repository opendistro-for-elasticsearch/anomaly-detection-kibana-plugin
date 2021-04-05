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

import { EuiText, EuiLink } from '@elastic/eui';
import React, { useState } from 'react';
import { get, isEmpty } from 'lodash';
import { FILTER_TYPES, UIFilter } from '../../../../models/interfaces';
import { CodeModal } from '../../../../components/CodeModal/CodeModal';
import { displayText } from '../../../DefineDetector/components/DataFilterList/utils/helpers';

interface FilterDisplayListProps {
  uiMetadata: any;
  filterQuery: any;
}

export const FilterDisplayList = (props: FilterDisplayListProps) => {
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [filterIndex, setFilterIndex] = useState<number>(-1);
  let filters = get(props, 'uiMetadata.filters', []);

  if (isEmpty(filters)) {
    return (
      <EuiText>
        <p className="enabled">-</p>
      </EuiText>
    );
  }
  return (
    <ol>
      {filters.map((filter: UIFilter, index: number) => {
        if (filter.filterType === FILTER_TYPES.SIMPLE) {
          return (
            <li className="enabled" key={index}>
              {displayText(filter)}
            </li>
          );
        } else {
          return (
            <div>
              <EuiText>
                <p className="enabled">
                  {!isEmpty(filter.label)
                    ? `${filter.label}:`
                    : 'Custom expression:'}{' '}
                  <EuiLink
                    data-test-subj="viewFilter"
                    onClick={() => {
                      setShowCodeModal(true);
                      setFilterIndex(index);
                    }}
                  >
                    View code
                  </EuiLink>
                </p>
              </EuiText>
              {showCodeModal && filterIndex === index ? (
                <CodeModal
                  code={filter.query}
                  title="Filter query"
                  subtitle="Custom expression"
                  closeModal={() => setShowCodeModal(false)}
                />
              ) : null}
            </div>
          );
        }
      })}
    </ol>
  );
};
