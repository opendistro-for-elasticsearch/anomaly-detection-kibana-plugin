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

import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducers';
import { getDetectorList } from '../../../redux/reducers/ad';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import { EmptyDashboard } from '../Components/EmptyDashboard/EmptyDashboard';
import {
  EuiPageHeaderSection,
  EuiTitle,
  EuiPageHeader,
  EuiPage,
  EuiPageBody,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { SideBar } from '../Components/utils/SideBar';
import { DashboardHeader } from '../Components/utils/DashboardHeader';

export const Dashboard = () => {
  const dispatch = useDispatch();

  const isLoading = useSelector((state: AppState) => state.ad.requesting);

  // useCallBack ensures we don't recreate the funciton
  const onRefreshPage = useCallback(
    () =>
      dispatch(
        getDetectorList({
          from: 0,
          size: 1,
          search: '',
          sortDirection: SORT_DIRECTION.DESC,
          sortField: 'name',
        })
      ),
    []
  );

  const totalDetectors = useSelector(
    (state: AppState) => state.ad.totalDetectors
  );

  // onRefreshPage is called whenever onRefreshPage funciton is recreated
  useEffect(() => {
    onRefreshPage();
  }, [onRefreshPage]);

  return (
    <EuiPage style={{ flex: 1 }}>
      <SideBar />
      <EuiPageBody>
        <DashboardHeader />
        {isLoading == true ? (
          <div>
            <EuiLoadingSpinner size="s" />
            &nbsp;&nbsp;
            <EuiLoadingSpinner size="m" />
            &nbsp;&nbsp;
            <EuiLoadingSpinner size="l" />
            &nbsp;&nbsp;
            <EuiLoadingSpinner size="xl" />
          </div>
        ) : totalDetectors == 0 ? (
          <EmptyDashboard />
        ) : (
          <EuiPageHeader>
            <EuiPageHeaderSection>
              <EuiTitle size="l">
                <h1>Page under construction</h1>
              </EuiTitle>
            </EuiPageHeaderSection>
          </EuiPageHeader>
        )}
      </EuiPageBody>
    </EuiPage>
  );
};
