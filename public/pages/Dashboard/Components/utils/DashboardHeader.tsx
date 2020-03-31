import React from 'react';
import { EuiPageHeader, EuiTitle } from '@elastic/eui';
export const DashboardHeader = () => {
  return (
    <EuiPageHeader>
      <EuiTitle size="l">
        <h1>Dashboard</h1>
      </EuiTitle>
    </EuiPageHeader>
  );
};
