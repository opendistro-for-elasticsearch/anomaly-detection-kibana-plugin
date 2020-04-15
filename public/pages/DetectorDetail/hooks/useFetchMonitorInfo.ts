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

import { get, isEmpty } from 'lodash';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Monitor } from '../../../models/interfaces';
import { AppState } from '../../../redux/reducers';
import { searchMonitors } from '../../../redux/reducers/alerting';

//A hook which gets AD monitor.
export const useFetchMonitorInfo = (
  detectorId: string
): { monitor: Monitor | undefined; fetchMonitorError: boolean } => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAdMonitors = async () => {
      await dispatch(searchMonitors());
    };
    fetchAdMonitors();
  }, []);

  const monitors = useSelector((state: AppState) => state.alerting.monitors);
  const monitor = get(monitors, `${detectorId}.0`);
  const hasError = useSelector(
    (state: AppState) => state.alerting.errorMessage
  );
  return {
    monitor: monitor,
    fetchMonitorError: !isEmpty(hasError) && isEmpty(monitor),
  };
};
