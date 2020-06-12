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
import {
  API_URL_PREFIX,
  AD_PATH,
  DETECTORS,
  SLASH,
  INDICES_PATH,
  MAPPINGS_PATH,
} from '../utils/constants';

Cypress.Commands.add('mockGetDetectorOnAction', function(
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route(
    'GET',
    [API_URL_PREFIX, AD_PATH, DETECTORS + '*'].join(SLASH),
    `fixture:${fixtureFileName}`
  ).as('getDetectors');

  funcMockedOn();

  cy.wait('@getDetectors');
});

Cypress.Commands.add('mockCreateDetectorOnAction', function(
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route(
    'POST',
    [API_URL_PREFIX, AD_PATH, DETECTORS + '*'].join(SLASH),
    `fixture:${fixtureFileName}`
  ).as('createDetector');

  funcMockedOn();

  cy.wait('@createDetector');
});

Cypress.Commands.add('mockSearchIndexOnAction', function(
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route(
    'GET',
    [API_URL_PREFIX, AD_PATH, INDICES_PATH + '*'].join(SLASH),
    `fixture:${fixtureFileName}`
  ).as('getIndices');

  funcMockedOn();

  cy.wait('@getIndices');
});

Cypress.Commands.add('mockGetIndexMappingsOnAction', function(
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route(
    'GET',
    [API_URL_PREFIX, AD_PATH, MAPPINGS_PATH + '*'].join(SLASH),
    `fixture:${fixtureFileName}`
  ).as('getMappings');

  funcMockedOn();

  cy.wait('@getMappings');
});
