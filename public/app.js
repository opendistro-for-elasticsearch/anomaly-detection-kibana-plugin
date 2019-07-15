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

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import chrome from 'ui/chrome';
import { uiModules } from 'ui/modules';
import { Main } from './pages/main';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import 'ui/autoload/styles';

import configureStore from './redux/configureStore';
import { darkModeEnabled } from './utils/kibanaUtils';

const app = uiModules.get('apps/awsSearchServicesKibanaAdPlugin');

//Load Chart's dark mode CSS
if (darkModeEnabled()) {
  require('@elastic/charts/dist/theme_only_dark.css');
} else {
  require('@elastic/charts/dist/theme_only_light.css');
}

app.config($locationProvider => {
  $locationProvider.html5Mode({
    enabled: false,
    requireBase: false,
    rewriteLinks: false,
  });
});
app.config(stateManagementConfigProvider =>
  stateManagementConfigProvider.disable()
);

function RootController($scope, $element, $http) {
  const store = configureStore($http);
  const domNode = $element[0];
  render(
    <Provider store={store}>
      <Router>
        <Route render={props => <Main httpClient={$http} {...props} />} />
      </Router>
    </Provider>,
    domNode
  );

  $scope.$on('$destroy', () => {
    unmountComponentAtNode(domNode);
  });
}

chrome.setRootController('awsSearchServicesKibanaAdPlugin', RootController);
