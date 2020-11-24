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
  DETECTORS,
  INDICES_PATH,
  MAPPINGS_PATH,
  START_PATH,
  STOP_PATH,
  SLASH,
  SEARCH_PATH,
} from '../utils/constants';
import { buildAdApiUrl } from '../utils/helpers';

Cypress.Commands.overwrite('visit', (orig, url, options) => {
  if (Cypress.env('SECURITY_ENABLED')) {
    let newOptions = options;
    if (options) {
      newOptions['auth'] = {
        username: 'admin',
        password: 'admin',
      };
    } else {
      newOptions = {
        auth: {
          username: 'admin',
          password: 'admin',
        },
      };
    }
    orig(url, newOptions);
  } else {
    orig(url, options);
  }
});

Cypress.Commands.add('mockGetDetectorOnAction', function (
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(buildAdApiUrl(DETECTORS + '*'), {fixture: fixtureFileName}).as(
    'getDetectors'
  );

  funcMockedOn();

  cy.wait('@getDetectors');
});

Cypress.Commands.add('mockCreateDetectorOnAction', function (
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(buildAdApiUrl(DETECTORS + '*'), {fixture: fixtureFileName}).as(
    'createDetector'
  );

  funcMockedOn();

  cy.wait('@createDetector');
});

Cypress.Commands.add('mockSearchIndexOnAction', function (
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(buildAdApiUrl(INDICES_PATH + '*'), {fixture: fixtureFileName}).as(
    'getIndices'
  );

  funcMockedOn();

  cy.wait('@getIndices');
});

Cypress.Commands.add('mockSearchOnAction', function (
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(buildAdApiUrl(SEARCH_PATH), {fixture: fixtureFileName}).as(
    'searchES'
  );

  funcMockedOn();

  cy.wait('@searchES');
});

Cypress.Commands.add('mockGetIndexMappingsOnAction', function (
  fixtureFileName: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(
    buildAdApiUrl(MAPPINGS_PATH + '*'),
    {fixture: fixtureFileName}
  ).as('getMappings');

  funcMockedOn();

  cy.wait('@getMappings');
});

Cypress.Commands.add('mockStartDetectorOnAction', function (
  fixtureFileName: string,
  detectorId: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(
    buildAdApiUrl([DETECTORS, detectorId, START_PATH].join(SLASH)),
    {fixture: fixtureFileName}
  ).as('startDetector');

  funcMockedOn();

  cy.wait('@startDetector');
});

Cypress.Commands.add('mockStopDetectorOnAction', function (
  fixtureFileName: string,
  detectorId: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(
    buildAdApiUrl([DETECTORS, detectorId, STOP_PATH].join(SLASH)),
    {fixture: fixtureFileName}
  ).as('stopDetector');

  funcMockedOn();

  cy.wait('@stopDetector');
});

Cypress.Commands.add('mockDeleteDetectorOnAction', function (
  fixtureFileName: string,
  detectorId: string,
  funcMockedOn: VoidFunction
) {
  cy.server();
  cy.route2(
    buildAdApiUrl([DETECTORS, detectorId].join(SLASH)),
    {fixture: fixtureFileName}
  ).as('deleteDetector');

  funcMockedOn();

  cy.wait('@deleteDetector');
});
