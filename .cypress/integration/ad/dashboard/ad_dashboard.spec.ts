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
  AD_URL,
  APP_URL_PREFIX,
  DASHBOARD,
  SLASH,
} from '../../../utils/constants';

context('AD Dashboard', () => {
  it('Empty dashboard - no detector index', () => {
    cy.mockGetDetectorOnAction('no_detector_index_response.json', () => {
      cy.visit([APP_URL_PREFIX, AD_URL, DASHBOARD].join(SLASH));
    });
    cy.contains('h2', 'You have no detectors');
  });

  it('Empty dashboard - empty detector index', () => {
    cy.mockGetDetectorOnAction('empty_detector_index_response.json', () => {
      cy.visit([APP_URL_PREFIX, AD_URL, DASHBOARD].join(SLASH));
    });
    cy.contains('h2', 'You have no detectors');
  });

  it('AD dashboard - single stopped detector', () => {
    cy.mockGetDetectorOnAction('single_detector_index_response.json', () => {
      cy.visit([APP_URL_PREFIX, AD_URL, DASHBOARD].join(SLASH));
    });

    cy.contains('h3', 'Live anomalies');
    cy.contains(
      'p',
      'All matching detectors are under initialization or stopped for the last 30 minutes. Please adjust filters or come back later.'
    );
  });

  it('AD dashboard - create detector', () => {
    cy.mockGetDetectorOnAction('no_detector_index_response.json', () => {
      cy.visit([APP_URL_PREFIX, AD_URL, DASHBOARD].join(SLASH));
    });

    cy.mockSearchIndexOnAction('search_index_response.json', () => {
      cy.get('.euiButton--primary.euiButton--fill:first').click({
        force: true,
      });
    });

    const detectorName = 'detector-name';
    cy.get('input[name="detectorName"]').type(detectorName, { force: true });

    cy.mockGetIndexMappingsOnAction('index_mapping_response.json', () => {
      cy.get('input[role="textbox"]').type('e2e-test-index{enter}', {
        force: true,
      });
    });

    cy.get('select[name="timeField"]').select('timestamp', { force: true });

    cy.mockCreateDetectorOnAction('post_detectors_response.json', () => {
      cy.get('.euiButton--primary.euiButton--fill').click({ force: true });
    });

    cy.contains('h1', detectorName);
    cy.contains('h3', 'Detector configuration');
  });
});
