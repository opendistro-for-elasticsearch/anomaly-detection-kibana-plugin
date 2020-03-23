/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';
import React from 'react';
import { CreateDetector } from '../createDetector';

import { DetectorList } from '../DetectorsList';
import { ListRouterParams } from '../DetectorsList/List/List';
import { PreviewDetector } from '../PreviewDetector/containers/PreviewDetector';
import { Dashboard } from '../Dashboard/Container/Dashboard';
import { APP_PATH } from '../../utils/constants';

interface MainProps {}

export function Main(mainProps: MainProps) {
  return (
    <Switch>
      <Route
        exact
        path="/detectors"
        render={(props: RouteComponentProps<ListRouterParams>) => (
          <DetectorList {...props} />
        )}
      />
      <Route
        exact
        path="/create-ad/"
        render={(props: RouteComponentProps) => (
          <CreateDetector {...props} isEdit={false} />
        )}
      />
      <Route
        exact
        path="/detectors/:detectorId/edit"
        render={(props: RouteComponentProps) => (
          <CreateDetector {...props} isEdit={true} />
        )}
      />
      <Route
        path="/detectors/:detectorId/features/"
        render={(props: RouteComponentProps) => <PreviewDetector {...props} />}
      />
      <Route
        exact
        path={APP_PATH.DASHBOARD}
        render={(props: RouteComponentProps) => <Dashboard />}
      />
      <Redirect to="/dashboard" />
    </Switch>
  );
}
