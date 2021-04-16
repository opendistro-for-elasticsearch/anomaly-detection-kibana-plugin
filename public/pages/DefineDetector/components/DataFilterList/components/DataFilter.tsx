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
  EuiButton,
  EuiBadge,
  EuiButtonEmpty,
  EuiPopover,
  EuiPopoverTitle,
  EuiText,
  EuiSwitch,
  EuiFieldText,
  EuiSpacer,
} from '@elastic/eui';
import React, { useState, useEffect } from 'react';
import { FormikProps } from 'formik';
import { get, isEmpty } from 'lodash';
import { UIFilter } from '../../../../../models/interfaces';
import { SimpleFilter } from './SimpleFilter';
import { CustomFilter } from './CustomFilter';
import { FormattedFormRow } from '../../../../../components/FormattedFormRow/FormattedFormRow';
import { DetectorDefinitionFormikValues } from '../../../models/interfaces';
import { FILTER_TYPES } from '../../../../../models/interfaces';
import { getFilterLabel } from '../utils/helpers';

interface DataFilterProps {
  formikProps: FormikProps<DetectorDefinitionFormikValues>;
  filter: UIFilter;
  index: number;
  values: DetectorDefinitionFormikValues;
  replace(index: number, value: any): void;
  onOpen(): void;
  onSave(): void;
  onCancel(): void;
  onDelete(): void;
  openPopoverIndex: number;
  setOpenPopoverIndex(index: number): void;
  isNewFilter: boolean;
}

export const DataFilter = (props: DataFilterProps) => {
  const isPopoverOpen = props.openPopoverIndex === props.index;

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [origFilter, setOrigFilter] = useState<UIFilter | undefined>(undefined);
  const [filterType, setFilterType] = useState<FILTER_TYPES>(
    get(props, 'filter.filterType', FILTER_TYPES.SIMPLE)
  );
  const [isCustomLabel, setIsCustomLabel] = useState<boolean>(false);
  const [customLabel, setCustomLabel] = useState<string>(
    get(props, 'filter.label', '')
  );
  const [labelToDisplay, setLabelToDisplay] = useState<string>(
    get(props, 'filter.label', '')
  );

  // When the popover is first opened: save the original filter values to replace in case
  // the user cancels or clicks away
  const openPopover = () => {
    props.setOpenPopoverIndex(props.index);
    setIsSaving(false);
    setIsClosing(false);
    setOrigFilter(props.filter);
    setFilterType(get(props, 'filter.filterType', FILTER_TYPES.SIMPLE));
    setIsCustomLabel(get(props, 'filter.label', '').length > 0);
    setCustomLabel(get(props, 'filter.label', ''));
  };
  const closePopover = () => {
    props.setOpenPopoverIndex(-1);
  };

  // If the user cancels or clicks away without saving: replace any changed
  // values with the original filter values
  useEffect(() => {
    if (isClosing && !isSaving) {
      props.formikProps.setFieldValue(
        `filters.${props.index}.fieldInfo`,
        origFilter?.fieldInfo
      );
      props.formikProps.setFieldValue(
        `filters.${props.index}.operator`,
        origFilter?.operator
      );
      props.formikProps.setFieldValue(
        `filters.${props.index}.fieldValue`,
        origFilter?.fieldValue
      );
      props.formikProps.setFieldValue(
        `filters.${props.index}.fieldRangeStart`,
        origFilter?.fieldRangeStart
      );
      props.formikProps.setFieldValue(
        `filters.${props.index}.fieldRangeEnd`,
        origFilter?.fieldRangeEnd
      );
      props.formikProps.setFieldValue(
        `filters.${props.index}.filterType`,
        origFilter?.filterType
      );
      props.formikProps.setFieldValue(
        `filters.${props.index}.query`,
        origFilter?.query
      );
      props.formikProps.setFieldValue(
        `filters.${props.index}.label`,
        origFilter?.label
      );
    }
  }, [isClosing]);

  // Update the displayed label if the user is saving
  useEffect(() => {
    if (isClosing && isSaving) {
      if (isCustomLabel && customLabel.length > 0) {
        setLabelToDisplay(customLabel);
      } else {
        setLabelToDisplay(getFilterLabel(props.filter));
      }
    }
  }, [isClosing]);

  // Update the displayed label if the filter itself changes (user deletes a filter and
  // a new one falls into this index)
  useEffect(() => {
    if (props.filter) {
      if (!isEmpty(props.filter.label)) {
        //@ts-ignore
        setLabelToDisplay(props.filter.label);
      } else {
        setLabelToDisplay(getFilterLabel(props.filter));
      }
    }
  }, [props.filter]);

  const handleFormValidation = async (
    formikProps: FormikProps<DetectorDefinitionFormikValues>
  ) => {
    try {
      formikProps.setSubmitting(true);
      if (get(props, 'filter.filterType') === FILTER_TYPES.SIMPLE) {
        formikProps.setFieldTouched(`filters.${props.index}.fieldInfo`);
        formikProps.setFieldTouched(`filters.${props.index}.operator`);
        formikProps.setFieldTouched(`filters.${props.index}.fieldValue`);
        formikProps.setFieldTouched(`filters.${props.index}.fieldRangeStart`);
        formikProps.setFieldTouched(`filters.${props.index}.fieldRangeEnd`);
      } else {
        formikProps.setFieldTouched(`filters.${props.index}.query`);
      }
      formikProps.validateForm().then((errors) => {
        if (isEmpty(get(errors, `filters.${props.index}`, []))) {
          setIsSaving(true);
          props.onSave();
          closePopover();
        } else {
          setIsSaving(false);
        }
      });
    } catch (e) {
    } finally {
      formikProps.setSubmitting(false);
    }
  };

  const badge = (
    <EuiBadge
      key={props.index}
      color="hollow"
      iconType="cross"
      iconSide="right"
      iconOnClick={() => {
        props.onDelete();
      }}
      iconOnClickAriaLabel="onClick event for icon within the button"
      onClick={() => {
        openPopover();
      }}
      onClickAriaLabel="onClick event for the button"
    >
      {labelToDisplay}
    </EuiBadge>
  );

  const newFilterButton = (
    <EuiButtonEmpty
      style={{ marginTop: '-2px' }}
      size="xs"
      onClick={() => {
        props.onOpen();
        openPopover();
      }}
    >
      + Add data filter
    </EuiButtonEmpty>
  );

  return (
    <EuiFlexItem grow={false} style={{ marginBottom: '2px' }}>
      <EuiPopover
        ownFocus={true}
        initialFocus="[id=cancelSaveFilterButton]"
        button={props.isNewFilter ? newFilterButton : badge}
        isOpen={isPopoverOpen}
        closePopover={closePopover}
        anchorPosition="downCenter"
        onTrapDeactivation={() => {
          setIsClosing(true);
        }}
      >
        <EuiPopoverTitle>
          <EuiFlexGroup
            direction="row"
            alignItems="center"
            style={{ margin: '-18px' }}
          >
            <EuiFlexItem>
              <EuiText>
                <p style={{ textTransform: 'none' }}>
                  <b>Data filter</b>
                </p>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                onClick={() => {
                  filterType === FILTER_TYPES.SIMPLE
                    ? setFilterType(FILTER_TYPES.CUSTOM)
                    : setFilterType(FILTER_TYPES.SIMPLE);
                }}
              >
                {filterType === FILTER_TYPES.SIMPLE
                  ? 'Use query DSL'
                  : 'Use visual editor'}
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPopoverTitle>
        {filterType === FILTER_TYPES.SIMPLE ? (
          <SimpleFilter
            filter={props.filter}
            index={props.index}
            values={props.values}
            replace={props.replace}
          />
        ) : (
          <CustomFilter
            filter={props.filter}
            index={props.index}
            values={props.values}
            replace={props.replace}
          />
        )}
        <EuiSpacer />
        <EuiFlexGroup direction="column" style={{ margin: '0px' }}>
          <EuiFlexGroup direction="column">
            <EuiFlexItem>
              <EuiSwitch
                label={<EuiText>Create custom label?</EuiText>}
                checked={isCustomLabel}
                onChange={() => {
                  setIsCustomLabel(!isCustomLabel);
                  setCustomLabel('');
                }}
              />
            </EuiFlexItem>
            {isCustomLabel ? (
              <EuiFlexItem>
                <FormattedFormRow title="Custom label">
                  <EuiFieldText
                    name="customLabel"
                    id="customLabel"
                    placeholder="Enter a value"
                    value={customLabel}
                    onChange={(e) => {
                      setCustomLabel(e.target.value);
                    }}
                  />
                </FormattedFormRow>
              </EuiFlexItem>
            ) : null}
          </EuiFlexGroup>
          <EuiSpacer />
          <EuiFlexGroup
            alignItems="center"
            justifyContent="flexEnd"
            gutterSize="s"
          >
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                id="cancelSaveFilterButton"
                data-test-subj={`cancelFilter${props.index}Button`}
                onClick={() => {
                  props.onCancel();
                  closePopover();
                }}
              >
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                id="saveFilterButton"
                fill={true}
                data-test-subj={`saveFilter${props.index}Button`}
                isLoading={props.formikProps.isSubmitting}
                onClick={() => {
                  props.formikProps.setFieldValue(
                    `filters.${props.index}.filterType`,
                    filterType
                  );
                  props.formikProps.setFieldValue(
                    `filters.${props.index}.label`,
                    customLabel
                  );
                  handleFormValidation(props.formikProps);
                }}
              >
                Save
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexGroup>
      </EuiPopover>
    </EuiFlexItem>
  );
};
