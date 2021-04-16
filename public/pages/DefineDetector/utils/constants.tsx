/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { FILTER_TYPES, UIFilter } from '../../../models/interfaces';
import { OPERATORS_MAP } from '../../DefineDetector/components/DataFilterList/utils/constant';
import { DetectorDefinitionFormikValues } from '../../DefineDetector/models/interfaces';

export const EMPTY_UI_FILTER: UIFilter = {
  filterType: FILTER_TYPES.SIMPLE,
  fieldInfo: [],
  operator: OPERATORS_MAP.IS,
  fieldValue: '',
  query: '',
  label: '',
};

export const INITIAL_DETECTOR_DEFINITION_VALUES: DetectorDefinitionFormikValues = {
  name: '',
  description: '',
  index: [],
  filters: [],
  filterQuery: JSON.stringify({ bool: { filter: [] } }, null, 4),
  timeField: '',
  interval: 10,
  windowDelay: 1,
};
