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

/// <reference types="cypress" />

import {
  AD_PATH,
  AD_URL,
  API_URL_PREFIX,
  APP_URL_PREFIX,
  DASHBOARD,
  DETECTORS,
  SLASH,
} from '../../../utils/constants';

context('AD Dashboard', () => {
  it('Empty dashboard - no detector', () => {
    cy.server();
    cy.route(
      'GET',
      [API_URL_PREFIX, AD_PATH, DETECTORS + '*'].join(SLASH),
      'fixture:no_detector_index_response.json'
    ).as('getDetectors');

    cy.visit([APP_URL_PREFIX, AD_URL, DASHBOARD].join(SLASH));

    cy.wait('@getDetectors', { requestTimeout: 60_000 });

    cy.contains('h2', 'You have no detectors');
  });
});
