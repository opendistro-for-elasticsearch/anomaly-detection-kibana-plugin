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
import { CREATE_AD } from '../../../utils/constants';
import { buildAdAppUrl } from '../../../utils/helpers';

context('Create detector', () => {
  it('Create detector - from dashboard', () => {
    cy.mockSearchIndexOnAction('search_index_response.json', () => {
      cy.visit(buildAdAppUrl(CREATE_AD));
    });

    cy.contains('h1', 'Create detector');

    const detectorName = 'detector-name';
    cy.get('input[name="detectorName"]').type(detectorName, { force: true });

    cy.mockGetIndexMappingsOnAction('index_mapping_response.json', () => {
      cy.get('input[role="textbox"]').first().type('e2e-test-index{enter}', {
        force: true,
      });
    });

    cy.get('input[role="textbox"]').last().type('timestamp{enter}', {
      force: true,
    });

    cy.mockCreateDetectorOnAction('post_detector_response.json', () => {
      cy.get('[data-test-subj=createOrSaveDetectorButton]').click({
        force: true,
      });
    });

    cy.contains('h1', detectorName);
    cy.contains('h3', 'Detector configuration');
  });
});
