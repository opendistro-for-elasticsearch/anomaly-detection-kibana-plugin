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

import { DETECTORS } from '../../../utils/constants';
import { buildAdAppUrl } from '../../../utils/helpers';

context('Detector list', () => {
  it.only('Empty detectors - no detector index', () => {
    cy.mockGetDetectorOnAction('no_detector_index_response.json', () => {
      cy.visit(buildAdAppUrl(DETECTORS));
    });

    cy.contains('p', '(0)');
    cy.contains(
      'p',
      'Anomaly detectors take an input of information and discover patterns of anomalies. Create an anomaly detector to get started.'
    );
    cy.get('.euiButton--primary.euiButton--fill').should('have.length', 2);
  });

  it.only('Empty detectors - empty detector index', () => {
    cy.mockGetDetectorOnAction('empty_detector_index_response.json', () => {
      cy.visit(buildAdAppUrl(DETECTORS));
    });

    cy.contains('p', '(0)');
    cy.contains(
      'p',
      'Anomaly detectors take an input of information and discover patterns of anomalies. Create an anomaly detector to get started.'
    );
    cy.get('.euiButton--primary.euiButton--fill').should('have.length', 2);
  });
});
