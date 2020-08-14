/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { SORT_DIRECTION } from '../../../../../server/utils/constants';
import {
  getURLQueryParams,
  getMonitorsForAction,
  getDetectorStateOptions,
  getDetectorsForAction,
} from '../helpers';
import { DetectorListItem, Monitor } from '../../../../models/interfaces';
import { DETECTOR_STATE } from '../../../../utils/constants';
import { DETECTOR_ACTION } from '../constants';

describe('helpers spec', () => {
  describe('getURLQueryParams', () => {
    test('should return default values', () => {
      expect(getURLQueryParams({ search: '' })).toEqual({
        from: 0,
        size: 20,
        search: '',
        indices: '',
        sortField: 'name',
        sortDirection: SORT_DIRECTION.ASC,
      });
    });
    test('should  default values if missing from queryParams', () => {
      expect(
        getURLQueryParams({ search: 'from=100&size=20&indices=&search=test' })
      ).toEqual({
        from: 100,
        size: 20,
        search: 'test',
        indices: '',
        sortField: 'name',
        sortDirection: SORT_DIRECTION.ASC,
      });
    });
    test('should return queryParams from location', () => {
      expect(
        getURLQueryParams({
          search:
            'from=100&size=5&indices=someIndex&search=test&sortField=name&sortDirection=desc',
        })
      ).toEqual({
        from: 100,
        size: 5,
        search: 'test',
        indices: 'someIndex',
        sortField: 'name',
        sortDirection: SORT_DIRECTION.DESC,
      });
    });
  });

  describe('getDetectorStateOptions spec', () => {
    test('should return all detector states', () => {
      const result = getDetectorStateOptions();
      expect(result.length).toEqual(6);
      expect(result[0].label).toEqual(DETECTOR_STATE.DISABLED);
      expect(result[1].label).toEqual(DETECTOR_STATE.INIT);
      expect(result[2].label).toEqual(DETECTOR_STATE.RUNNING);
      expect(result[3].label).toEqual(DETECTOR_STATE.FEATURE_REQUIRED);
      expect(result[4].label).toEqual(DETECTOR_STATE.INIT_FAILURE);
      expect(result[5].label).toEqual(DETECTOR_STATE.UNEXPECTED_FAILURE);
    });
  });

  describe('getDetectorsForAction spec', () => {
    const testDetectors = [
      {
        id: 'detectorId1',
        name: 'stopped-detector',
        curState: DETECTOR_STATE.DISABLED,
      },
      {
        id: 'detectorId2',
        name: 'init-detector',
        curState: DETECTOR_STATE.INIT,
      },
      {
        id: 'detectorId1',
        name: 'running-detector',
        curState: DETECTOR_STATE.RUNNING,
      },
      {
        id: 'detectorId2',
        name: 'feature-required-detector',
        curState: DETECTOR_STATE.FEATURE_REQUIRED,
      },
      {
        id: 'detectorId1',
        name: 'init-failure-detector',
        curState: DETECTOR_STATE.INIT_FAILURE,
      },
      {
        id: 'detectorId2',
        name: 'unexpected-failure-detector',
        curState: DETECTOR_STATE.UNEXPECTED_FAILURE,
      },
    ] as DetectorListItem[];
    test('filters properly for start action', () => {
      const result = getDetectorsForAction(
        testDetectors,
        DETECTOR_ACTION.START
      );
      expect(result.length).toEqual(3);
      expect(result[0].name).toEqual('stopped-detector');
      expect(result[1].name).toEqual('init-failure-detector');
      expect(result[2].name).toEqual('unexpected-failure-detector');
    });
    test('filters properly for stop action', () => {
      const result = getDetectorsForAction(testDetectors, DETECTOR_ACTION.STOP);
      expect(result.length).toEqual(2);
      expect(result[0].name).toEqual('init-detector');
      expect(result[1].name).toEqual('running-detector');
    });
    test('filters properly for delete action', () => {
      const result = getDetectorsForAction(
        testDetectors,
        DETECTOR_ACTION.DELETE
      );
      expect(result.length).toEqual(6);
    });
    test('filters properly for undefined/invalid action', () => {
      const result = getDetectorsForAction(testDetectors, 'something-invalid');
      expect(result.length).toEqual(0);
    });
  });

  describe('getMonitorsForAction spec', () => {
    test('should return empty if no related monitors', () => {
      const testDetectors = [
        {
          id: 'detectorId1',
          name: 'test-detector-1',
        },
        {
          id: 'detectorId2',
          name: 'test-detector-2',
        },
      ] as DetectorListItem[];
      let testMonitors: { [key: string]: Monitor } = {};
      testMonitors = {
        detectorId1: [],
        detectorId2: [],
      };
      expect(getMonitorsForAction(testDetectors, testMonitors)).toEqual({});
    });
    test('should return related monitors', () => {
      const testDetectors = [
        {
          id: 'detectorId1',
          name: 'test-detector-1',
        },
        {
          id: 'detectorId2',
          name: 'test-detector-2',
        },
      ] as DetectorListItem[];
      let testMonitors: { [key: string]: Monitor } = {};
      testMonitors = {
        detectorId1: [
          {
            id: 'monitorId1',
            name: 'test-monitor-1',
          },
        ],
        detectorId2: [],
      };
      expect(getMonitorsForAction(testDetectors, testMonitors)).toEqual({
        detectorId1: {
          id: 'monitorId1',
          name: 'test-monitor-1',
        },
      });
    });
  });
});
