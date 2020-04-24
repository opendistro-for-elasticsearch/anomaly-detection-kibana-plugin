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

import React, { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducers';
import { getDetectorList } from '../../../redux/reducers/ad';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import { EmptyDashboard } from '../Components/EmptyDashboard/EmptyDashboard';
import { EuiLoadingSpinner } from '@elastic/eui';
import { DashboardHeader } from '../Components/utils/DashboardHeader';
import { DashboardOverview } from './DashboardOverview';

export const Dashboard = () => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  const onRefreshPage = async () => {
    try {
      await dispatch(
        getDetectorList({
          from: 0,
          size: 1,
          search: '',
          sortDirection: SORT_DIRECTION.DESC,
          sortField: 'name',
        })
      );
    } catch (error) {
      console.log('Error is found during getting detector list', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDetectors = useSelector(
    (state: AppState) => state.ad.totalDetectors
  );

  const hasDetectors = totalDetectors > 0;

  useEffect(() => {
    onRefreshPage();
  }, []);
  return (
    <Fragment>
      <DashboardHeader hasDetectors={hasDetectors} />
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
      ) : !hasDetectors ? (
        <EmptyDashboard />
      ) : (
        <DashboardOverview />
      )}
    </Fragment>
  );
};
