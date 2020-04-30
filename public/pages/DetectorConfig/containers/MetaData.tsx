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

import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import {
  //@ts-ignore
  EuiFlexGrid,
  EuiFlexItem,
  EuiText,
  EuiFormRow,
  EuiLink,
  EuiButton,
  EuiFormRowProps,
} from '@elastic/eui';
import { PLUGIN_NAME } from '../../../utils/constants';
import {
  Detector,
  Schedule,
  UiMetaData,
  FILTER_TYPES,
  UIFilter,
} from '../../../models/interfaces';
import React, { Component, FunctionComponent } from 'react';
import { displayText } from '../../createDetector/components/DataFilters/utils/helpers';
import { CodeModal } from '../components/CodeModal/CodeModal';
import moment from 'moment';

interface MetaDataProps {
  detectorId: string;
  detector: Detector;
  onEditDetector(): void;
}

const FixedWidthRow = (props: EuiFormRowProps) => (
  <EuiFormRow {...props} style={{ width: '250px' }} />
);

interface ConfigCellProps {
  title: string;
  description: string | string[];
}

const ConfigCell: FunctionComponent<ConfigCellProps> = (
  props: ConfigCellProps
) => {
  return (
    <FixedWidthRow label={props.title}>
      <EuiText>
        <p className="enabled">{props.description}</p>
      </EuiText>
    </FixedWidthRow>
  );
};

export function toString(obj: any): string {
  // render calls this method.  During different lifecylces, obj can be undefined
  if (typeof obj != 'undefined') {
    if (obj.hasOwnProperty('period')) {
      let period = obj.period;
      return period.interval + ' ' + period.unit;
    } else if (typeof obj == 'number') {
      // epoch
      return moment(obj).format('MM/DD/YY hh:mm A');
    }
  }
  return '-';
}

interface FilterDisplayProps {
  filterInputs: Detector;
}

interface FilterDisplayState {
  showCodeModel: boolean;
}

export class FilterDisplay extends Component<
  FilterDisplayProps,
  FilterDisplayState
> {
  constructor(props: FilterDisplayProps) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.getModalVisibilityChange = this.getModalVisibilityChange.bind(this);
    this.state = {
      showCodeModel: false,
    };
  }

  private closeModal() {
    this.setState({
      showCodeModel: false,
    });
  }

  private showModal() {
    this.setState({
      showCodeModel: true,
    });
  }

  private getModalVisibilityChange = () => {
    return this.state.showCodeModel;
  };

  public render() {
    let filter = this.props.filterInputs.uiMetadata;

    if (filter == undefined || filter.filterType == undefined) {
      return (
        <EuiText>
          <p className="enabled">-</p>
        </EuiText>
      );
    }
    if (filter.filterType == FILTER_TYPES.SIMPLE) {
      let filters = filter.filters;
      let n = filters.length;
      let content;

      if (n == 0) {
        content = <p className="enabled">-</p>;
      } else if (n == 1) {
        content = <p className="enabled">{displayText(filters[0])}</p>;
      } else {
        content = (
          <ol>
            {filters.map((filter: UIFilter, index: number) => {
              return (
                <li className="enabled" key={index}>
                  {displayText(filter)}
                </li>
              );
            })}
          </ol>
        );
      }
      return <EuiText>{content}</EuiText>;
    } else {
      return (
        <div>
          <EuiText>
            <p className="enabled">
              Custom expression:{' '}
              <EuiLink data-test-subj="viewFilter" onClick={this.showModal}>
                View code
              </EuiLink>
            </p>
          </EuiText>
          {!this.getModalVisibilityChange() ? null : (
            <CodeModal
              code={JSON.stringify(
                this.props.filterInputs.filterQuery || {},
                null,
                4
              )}
              title="Filter query"
              subtitle="Custom expression"
              getModalVisibilityChange={this.getModalVisibilityChange}
              closeModal={this.closeModal}
            />
          )}
        </div>
      );
    }
  }
}

export const MetaData = (props: MetaDataProps) => {
  let detector = props.detector;

  return (
    <ContentPanel
      title="Detector configuration"
      titleSize="s"
      actions={[<EuiButton onClick={props.onEditDetector}>Edit</EuiButton>]}
    >
      <EuiFlexGrid columns={4} gutterSize="l" style={{ border: 'none' }}>
        <EuiFlexItem>
          <ConfigCell title="Name" description={detector.name} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell
            title="Data source index"
            description={detector.indices}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell
            title="Detector interval"
            description={toString(detector.detectionInterval)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell
            title="Last Updated"
            description={toString(detector.lastUpdateTime)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="ID" description={detector.id} />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell
            title="Window delay"
            description={toString(detector.windowDelay)}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <ConfigCell title="Description" description={detector.description} />
        </EuiFlexItem>
        <EuiFlexItem>
          <FixedWidthRow label="Data filter">
            <FilterDisplay filterInputs={detector} />
          </FixedWidthRow>
        </EuiFlexItem>
      </EuiFlexGrid>
    </ContentPanel>
  );
};
