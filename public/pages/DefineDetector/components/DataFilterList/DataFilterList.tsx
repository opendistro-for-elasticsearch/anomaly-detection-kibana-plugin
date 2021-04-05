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

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiIcon,
  EuiButtonEmpty,
  EuiCallOut,
} from '@elastic/eui';
import { FieldArray, FieldArrayRenderProps, FormikProps } from 'formik';
import React, { useState, Fragment } from 'react';
import { get } from 'lodash';
import { DetectorDefinitionFormikValues } from '../../models/interfaces';
import { UIFilter } from '../../../../models/interfaces';
import { DataFilter } from './components/DataFilter';

import { FormattedFormRow } from '../../../../components/FormattedFormRow/FormattedFormRow';
import { EMPTY_UI_FILTER } from '../../utils/constants';

interface DataFilterListProps {
  formikProps: FormikProps<DetectorDefinitionFormikValues>;
}

export const DataFilterList = (props: DataFilterListProps) => {
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number>(-1);
  const [isCreatingNewFilter, setIsCreatingNewFilter] = useState<boolean>(
    false
  );

  const selectedIndex = get(props, 'formikProps.values.index.0.label', '');
  const isRemoteIndex = selectedIndex.includes(':');

  return (
    <FieldArray name="filters" validateOnChange={true}>
      {({ push, remove, replace, form: { values } }: FieldArrayRenderProps) => {
        const lastFilterIndex = values.filters.length - 1;
        if (isCreatingNewFilter && openPopoverIndex !== lastFilterIndex) {
          setIsCreatingNewFilter(false);
          remove(lastFilterIndex);
        }

        return (
          <Fragment>
            <FormattedFormRow
              fullWidth
              formattedTitle={
                <p>
                  Data filter
                  <span className="optional">- optional</span>
                </p>
              }
              hint={[
                'Choose a subset of your data source to focus your data stream and reduce noisy data.',
              ]}
              hintLink={
                'https://opendistro.github.io/for-elasticsearch-docs/docs/ad/'
              }
            >
              <Fragment>
                <EuiSpacer size="m" />
                {isRemoteIndex ? (
                  <div>
                    <EuiCallOut
                      title="A remote index is selected, so you need to manually input the filter fields."
                      color="warning"
                      iconType="alert"
                      size="s"
                      style={{ marginTop: '-4px' }}
                    />
                    <EuiSpacer size="m" />
                  </div>
                ) : null}
                <EuiFlexGroup direction="row" gutterSize="xs">
                  <EuiFlexItem grow={false}>
                    <EuiIcon
                      type="filter"
                      style={{ marginRight: '8px', marginTop: '2px' }}
                    />
                  </EuiFlexItem>
                  {values.filters.map((filter: UIFilter, index: number) => {
                    return (
                      <DataFilter
                        formikProps={props.formikProps}
                        filter={filter}
                        index={index}
                        values={values}
                        replace={() => replace}
                        onOpen={() => {}}
                        onSave={() => {
                          if (isCreatingNewFilter) {
                            setIsCreatingNewFilter(false);
                          }
                        }}
                        onCancel={() => {
                          if (isCreatingNewFilter) {
                            setIsCreatingNewFilter(false);
                            remove(lastFilterIndex);
                          }
                        }}
                        onDelete={() => {
                          remove(index);
                          setOpenPopoverIndex(-1);
                        }}
                        openPopoverIndex={openPopoverIndex}
                        setOpenPopoverIndex={setOpenPopoverIndex}
                        isNewFilter={
                          isCreatingNewFilter && index === lastFilterIndex
                            ? true
                            : false
                        }
                      />
                    );
                  })}
                  {isCreatingNewFilter && values.filters.length > 0 ? null : (
                    <EuiFlexItem grow={false} style={{ marginTop: '0px' }}>
                      <EuiButtonEmpty
                        size="xs"
                        onClick={() => {
                          setIsCreatingNewFilter(true);
                          push(EMPTY_UI_FILTER);
                          setOpenPopoverIndex(lastFilterIndex + 1);
                        }}
                      >
                        + Add data filter
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
              </Fragment>
            </FormattedFormRow>
          </Fragment>
        );
      }}
    </FieldArray>
  );
};
