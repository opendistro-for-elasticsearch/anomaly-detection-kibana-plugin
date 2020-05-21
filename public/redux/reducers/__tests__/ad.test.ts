import { MockStore } from 'redux-mock-store';
import httpMockedClient from '../../../../test/mocks/httpClientMock';
import { BASE_NODE_API_PATH } from '../../../../utils/constants';
import { mockedStore } from '../../utils/testUtils';
import reducer, {
  createDetector,
  deleteDetector,
  getDetector,
  initialDetectorsState,
  searchDetector,
  updateDetector,
} from '../ad';
import { getRandomDetector } from './utils';
import { get } from 'lodash';

describe('detector reducer actions', () => {
  let store: MockStore;
  beforeEach(() => {
    store = mockedStore();
  });
  describe('getDetector', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const expectedDetector = getRandomDetector(true);
      const detectorId = 'randomDetectorID';
      httpMockedClient.get = jest
        .fn()
        .mockResolvedValue({ data: { ok: true, response: expectedDetector } });
      await store.dispatch(getDetector(detectorId));
      const actions = store.getActions();
      expect(actions[0].type).toBe('ad/GET_DETECTOR_REQUEST');
      expect(reducer(initialDetectorsState, actions[0])).toEqual({
        ...initialDetectorsState,
        requesting: true,
      });
      expect(actions[1].type).toBe('ad/GET_DETECTOR_SUCCESS');
      expect(reducer(initialDetectorsState, actions[1])).toEqual({
        ...initialDetectorsState,
        requesting: false,
        detectors: {
          [detectorId]: {
            ...expectedDetector,
          },
        },
      });
      expect(httpMockedClient.get).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/detectors/${detectorId}`
      );
    });
    test('should invoke [REQUEST, FAILURE]', async () => {
      const detectorId = 'randomDetectorID';
      httpMockedClient.get = jest.fn().mockRejectedValue('Not found');
      try {
        await store.dispatch(getDetector(detectorId));
      } catch (e) {
        const actions = store.getActions();
        expect(actions[0].type).toBe('ad/GET_DETECTOR_REQUEST');
        expect(reducer(initialDetectorsState, actions[0])).toEqual({
          ...initialDetectorsState,
          requesting: true,
        });
        expect(actions[1].type).toBe('ad/GET_DETECTOR_FAILURE');
        expect(reducer(initialDetectorsState, actions[1])).toEqual({
          ...initialDetectorsState,
          requesting: false,
          errorMessage: 'Not found',
        });
        expect(httpMockedClient.get).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/detectors/${detectorId}`
        );
      }
    });
  });

  describe('deleteDetector', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const expectedDetector = getRandomDetector(false);
      httpMockedClient.get = jest
        .fn()
        .mockResolvedValue({ data: { ok: true, response: {} } });
      await store.dispatch(deleteDetector(expectedDetector.id));
      const actions = store.getActions();
      expect(actions[0].type).toBe('ad/DELETE_DETECTOR_REQUEST');
      expect(reducer(initialDetectorsState, actions[0])).toEqual({
        ...initialDetectorsState,
        requesting: true,
      });
      expect(actions[1].type).toBe('ad/DELETE_DETECTOR_SUCCESS');
      expect(reducer(initialDetectorsState, actions[1])).toEqual({
        ...initialDetectorsState,
        requesting: false,
        detectors: {
          [expectedDetector.id]: undefined,
        },
      });
      expect(httpMockedClient.delete).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/detectors/${expectedDetector.id}`
      );
    });
    test('should invoke [REQUEST, FAILURE]', async () => {
      const expectedDetector = getRandomDetector(false);
      httpMockedClient.get = jest.fn().mockRejectedValue({
        data: { ok: false, error: 'Detector is consumed by Monitor' },
      });
      try {
        await store.dispatch(deleteDetector(expectedDetector.id));
      } catch (e) {
        const actions = store.getActions();
        expect(actions[0].type).toBe('ad/DELETE_DETECTOR_REQUEST');
        expect(reducer(initialDetectorsState, actions[0])).toEqual({
          ...initialDetectorsState,
          requesting: true,
        });
        expect(actions[1].type).toBe('ad/DELETE_DETECTOR_FAILURE');
        expect(reducer(initialDetectorsState, actions[1])).toEqual({
          ...initialDetectorsState,
          requesting: false,
          errorMessage: 'Detector is consumed by Monitor',
        });
        expect(httpMockedClient.delete).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/detectors/${expectedDetector.id}`
        );
      }
    });
  });

  describe('createDetector', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const expectedDetector = getRandomDetector();
      const detectorId = 'randomDetectorID';
      httpMockedClient.post = jest.fn().mockResolvedValue({
        data: { ok: true, response: { ...expectedDetector, id: detectorId } },
      });
      await store.dispatch(createDetector(expectedDetector));
      const actions = store.getActions();
      expect(actions[0].type).toBe('ad/CREATE_DETECTOR_REQUEST');
      expect(reducer(initialDetectorsState, actions[0])).toEqual({
        ...initialDetectorsState,
        requesting: true,
      });
      expect(actions[1].type).toBe('ad/CREATE_DETECTOR_SUCCESS');
      expect(reducer(initialDetectorsState, actions[1])).toEqual({
        ...initialDetectorsState,
        requesting: false,
        detectors: {
          [detectorId]: {
            ...expectedDetector,
            id: detectorId,
          },
        },
      });
      expect(httpMockedClient.post).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/detectors`,
        expectedDetector
      );
    });

    test('should invoke [REQUEST, FAILURE]', async () => {
      const expectedDetector = getRandomDetector();
      httpMockedClient.post = jest.fn().mockRejectedValue({
        data: { ok: false, error: 'Internal server error' },
      });
      try {
        await store.dispatch(createDetector(expectedDetector));
      } catch {
        const actions = store.getActions();
        expect(actions[0].type).toBe('ad/CREATE_DETECTOR_REQUEST');
        expect(reducer(initialDetectorsState, actions[0])).toEqual({
          ...initialDetectorsState,
          requesting: true,
        });
        expect(actions[1].type).toBe('ad/CREATE_DETECTOR_FAILURE');
        expect(reducer(initialDetectorsState, actions[1])).toEqual({
          ...initialDetectorsState,
          requesting: false,
          errorMessage: 'Internal server error',
        });
        expect(httpMockedClient.post).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/detectors`,
          expectedDetector
        );
      }
    });
  });
  describe('updateDetector', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const randomDetector = getRandomDetector(false);
      const detectorId = randomDetector.id;
      httpMockedClient.put = jest.fn().mockResolvedValue({
        data: { ok: true, response: { ...randomDetector, id: detectorId } },
      });
      await store.dispatch(updateDetector(detectorId, randomDetector));
      const actions = store.getActions();
      expect(actions[0].type).toBe('ad/UPDATE_DETECTOR_REQUEST');
      expect(reducer(initialDetectorsState, actions[0])).toEqual({
        ...initialDetectorsState,
        requesting: true,
      });
      expect(actions[1].type).toBe('ad/UPDATE_DETECTOR_SUCCESS');
      const result = reducer(initialDetectorsState, actions[1]);
      expect(result).toEqual({
        ...initialDetectorsState,
        requesting: false,
        detectors: {
          [detectorId]: {
            ...randomDetector,
            id: detectorId,
            lastUpdateTime: get(
              result,
              `detectors.${detectorId}.lastUpdateTime`
            ),
          },
        },
      });
      expect(httpMockedClient.put).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/detectors/${detectorId}`,
        randomDetector,
        {
          params: {
            ifPrimaryTerm: randomDetector.primaryTerm,
            ifSeqNo: randomDetector.seqNo,
          },
        }
      );
    });

    test('should invoke [REQUEST, FAILURE]', async () => {
      const randomDetector = getRandomDetector(true);
      const detectorId = randomDetector.id;
      httpMockedClient.post = jest.fn().mockRejectedValue({
        data: { ok: false, error: 'Invalid primary Term' },
      });
      try {
        await store.dispatch(updateDetector(detectorId, randomDetector));
      } catch {
        const actions = store.getActions();
        expect(actions[0].type).toBe('ad/UPDATE_DETECTOR_REQUEST');
        expect(reducer(initialDetectorsState, actions[0])).toEqual({
          ...initialDetectorsState,
          requesting: true,
        });
        expect(actions[1].type).toBe('ad/UPDATE_DETECTOR_FAILURE');
        expect(reducer(initialDetectorsState, actions[1])).toEqual({
          ...initialDetectorsState,
          requesting: false,
          errorMessage: 'Internal server error',
        });
        expect(httpMockedClient.post).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/detectors`,
          randomDetector,
          {
            params: {
              ifPrimaryTerm: randomDetector.primaryTerm,
              ifSeqNo: randomDetector.seqNo,
            },
          }
        );
      }
    });
  });
  describe('searchDetectors', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const randomDetectors = [getRandomDetector(), getRandomDetector()];
      const query = { query: { match: { match_all: {} } } };
      httpMockedClient.post = jest.fn().mockResolvedValue({
        data: {
          ok: true,
          response: {
            detectors: randomDetectors,
            totalDetectors: randomDetectors.length,
          },
        },
      });
      await store.dispatch(searchDetector(query));
      const actions = store.getActions();
      expect(actions[0].type).toBe('ad/SEARCH_DETECTOR_REQUEST');
      expect(reducer(initialDetectorsState, actions[0])).toEqual({
        ...initialDetectorsState,
        requesting: true,
      });
      expect(actions[1].type).toBe('ad/SEARCH_DETECTOR_SUCCESS');
      expect(reducer(initialDetectorsState, actions[1])).toEqual({
        ...initialDetectorsState,
        requesting: false,
        detectors: randomDetectors.reduce(
          (acc, detector) => ({ ...acc, [detector.id]: { ...detector } }),
          {}
        ),
      });
      expect(httpMockedClient.post).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/detectors/_search`,
        query
      );
    });

    test('should invoke [REQUEST, FAILURE]', async () => {
      const randomDetector = getRandomDetector();
      const detectorId = randomDetector.id;
      httpMockedClient.post = jest.fn().mockRejectedValue({
        data: { ok: false, error: 'Invalid primary Term' },
      });
      try {
        await store.dispatch(updateDetector(detectorId, randomDetector));
      } catch {
        const actions = store.getActions();
        expect(actions[0].type).toBe('ad/UPDATE_DETECTOR_REQUEST');
        expect(reducer(initialDetectorsState, actions[0])).toEqual({
          ...initialDetectorsState,
          requesting: true,
        });
        expect(actions[1].type).toBe('ad/UPDATE_DETECTOR_FAILURE');
        expect(reducer(initialDetectorsState, actions[1])).toEqual({
          ...initialDetectorsState,
          requesting: false,
          errorMessage: 'Internal server error',
        });
        expect(httpMockedClient.post).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/detectors`,
          randomDetector
        );
      }
    });
  });
});
