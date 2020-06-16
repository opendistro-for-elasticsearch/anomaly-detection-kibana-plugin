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
import { DETECTORS, INDICES_PATH, MAPPINGS_PATH } from '../utils/constants';
import { buildAdApiUrl } from '../utils/helpers';

Cypress.Commands.add('mockGetDetectorOnAction', function(
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route(
    'GET',
    buildAdApiUrl(DETECTORS + '*'),
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
    buildAdApiUrl(DETECTORS + '*'),
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
    buildAdApiUrl(INDICES_PATH + '*'),
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
    buildAdApiUrl(MAPPINGS_PATH + '*'),
    `fixture:${fixtureFileName}`
  ).as('getMappings');

  funcMockedOn();

  cy.wait('@getMappings');
});
