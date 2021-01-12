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

import { CoreStart, AppMountParameters } from '../../../src/core/public';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Main } from './pages/main';
import { Provider } from 'react-redux';
import configureStore from './redux/configureStore';
import { CoreServicesContext } from './components/CoreServices/CoreServices';

export function renderApp(coreStart: CoreStart, params: AppMountParameters) {
  const http = coreStart.http;
  const store = configureStore(http);

  // Load Chart's dark mode CSS (if applicable)
  const isDarkMode = coreStart.uiSettings.get('theme:darkMode') || false;
  if (isDarkMode) {
    require('@elastic/charts/dist/theme_only_dark.css');
  } else {
    require('@elastic/charts/dist/theme_only_light.css');
  }
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <Route
          render={(props) => (
            <CoreServicesContext.Provider value={coreStart}>
              <Main {...props} />
            </CoreServicesContext.Provider>
          )}
        />
      </Router>
    </Provider>,
    params.element
  );
  return () => ReactDOM.unmountComponentAtNode(params.element);
}
