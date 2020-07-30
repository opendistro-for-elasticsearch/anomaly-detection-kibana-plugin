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

import { DASHBOARD } from '../../../utils/constants';
import { buildAdAppUrl } from '../../../utils/helpers';

context('AD Dashboard', () => {
  it('Empty dashboard - no detector index', () => {
    cy.mockGetDetectorOnAction('no_detector_index_response.json', () => {
      cy.visit(buildAdAppUrl(DASHBOARD));
    });
    cy.contains('h2', 'You have no detectors');
  });

  it('Empty dashboard - empty detector index', () => {
    cy.mockGetDetectorOnAction('empty_detector_index_response.json', () => {
      cy.visit(buildAdAppUrl(DASHBOARD));
    });
    cy.contains('h2', 'You have no detectors');
  });

  it('AD dashboard - single stopped detector', () => {
    cy.mockGetDetectorOnAction('single_stopped_detector_response.json', () => {
      cy.visit(buildAdAppUrl(DASHBOARD));
    });

    cy.contains('h3', 'Live anomalies');
    cy.contains(
      'p',
      'All matching detectors are under initialization or stopped for the last 30 minutes. Please adjust filters or come back later.'
    );
  });

  it('AD dashboard - redirect to create detector', () => {
    cy.mockGetDetectorOnAction('no_detector_index_response.json', () => {
      cy.visit(buildAdAppUrl(DASHBOARD));
    });

    cy.mockSearchIndexOnAction('search_index_response.json', () => {
      cy.get('a[data-test-subj="add_detector"]').click({
        force: true,
      });
    });

    cy.contains('h1', 'Create detector');
  });

  it('Filter by detector', () => {
    cy.mockGetDetectorOnAction('multiple_detectors_response.json', () => {
      cy.visit(buildAdAppUrl(DASHBOARD));
    });

    cy.contains('stopped-detector');
    cy.contains('running-detector');

    cy.get('[data-test-subj=comboBoxToggleListButton]')
      .first()
      .click({ force: true });
    cy.get('.euiFilterSelectItem').first().click({ force: true });
    cy.get('.euiPageSideBar').click({ force: true });

    cy.contains('feature-required-detector'); // first one in the list returned by multiple_detectors_response.json
    cy.contains('stopped-detector').should('not.be.visible');
    cy.contains('running-detector').should('not.be.visible');
  });

  it('Filter by detector state', () => {
    cy.mockGetDetectorOnAction('multiple_detectors_response.json', () => {
      cy.visit(buildAdAppUrl(DASHBOARD));
    });

    cy.contains('stopped-detector');
    cy.contains('running-detector');

    cy.get('[data-test-subj=comboBoxToggleListButton]')
      .eq(1)
      .click({ force: true });
    cy.get('.euiFilterSelectItem').first().click({ force: true });
    cy.get('.euiPageSideBar').click({ force: true });

    cy.contains('stopped-detector'); // because stopped is the first item in the detector state dropdown
    cy.contains('running-detector').should('not.be.visible');
  });
});
