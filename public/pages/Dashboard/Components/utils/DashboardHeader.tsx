import React from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageHeader,
  EuiTitle,
} from '@elastic/eui';
import { PLUGIN_NAME, APP_PATH } from '../../../../utils/constants';
export interface DashboardHeaderProps {
  hasDetectors: boolean;
}

export const DashboardHeader = (props: DashboardHeaderProps) => {
  return (
    <EuiPageHeader>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiTitle size="l">
            <h1>Dashboard</h1>
          </EuiTitle>
        </EuiFlexItem>
        {props.hasDetectors ? (
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              href={`${PLUGIN_NAME}#${APP_PATH.CREATE_DETECTOR}`}
              target="_blank"
              data-test-subj="add_detector"
            >
              Create detector
            </EuiButton>
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    </EuiPageHeader>
  );
};
