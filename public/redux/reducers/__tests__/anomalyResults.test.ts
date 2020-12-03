import { MockStore } from 'redux-mock-store';
import { DetectorResultsQueryParams } from '../../../../server/models/types';
import { SORT_DIRECTION } from '../../../../server/utils/constants';
import httpMockedClient from '../../../../test/mocks/httpClientMock';
import { AD_NODE_API } from '../../../../utils/constants';
import { mockedStore } from '../../utils/testUtils';
import reducer, {
  getDetectorResults,
  initialDetectorsState,
} from '../anomalyResults';

describe('elasticsearch reducer actions', () => {
  let store: MockStore;
  beforeEach(() => {
    store = mockedStore();
  });
  describe('getDetectorResults', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const response = {
        totalAnomalies: 1,
        results: [{ anomalyGrade: 0, confidence: 1, starTime: 1, endTime: 2 }],
      };
      httpMockedClient.get = jest
        .fn()
        .mockResolvedValue({ ok: true, response });
      const tempDetectorId = '123';
      let queryParams: DetectorResultsQueryParams = {
        from: 0,
        size: 20,
        sortDirection: SORT_DIRECTION.ASC,
        sortField: 'startTime',
      };
      await store.dispatch(getDetectorResults(tempDetectorId, queryParams));
      const actions = store.getActions();

      expect(actions[0].type).toBe('ad/DETECTOR_RESULTS_REQUEST');
      expect(reducer(initialDetectorsState, actions[0])).toEqual({
        ...initialDetectorsState,
        requesting: true,
      });
      expect(actions[1].type).toBe('ad/DETECTOR_RESULTS_SUCCESS');
      expect(reducer(initialDetectorsState, actions[1])).toEqual({
        ...initialDetectorsState,
        requesting: false,
        total: response.totalAnomalies,
        anomalies: response.results,
        featureData: undefined,
      });
      expect(
        httpMockedClient.get
      ).toHaveBeenCalledWith(
        `..${AD_NODE_API.DETECTOR}/${tempDetectorId}/results`,
        { query: queryParams }
      );
    });
    test('should invoke [REQUEST, FAILURE]', async () => {
      httpMockedClient.get = jest.fn().mockRejectedValue({
        ok: false,
        error: 'Something went wrong',
      });
      const tempDetectorId = '123';
      let queryParams: DetectorResultsQueryParams = {
        from: 0,
        size: 20,
        sortDirection: SORT_DIRECTION.ASC,
        sortField: 'startTime',
      };
      try {
        await store.dispatch(getDetectorResults(tempDetectorId, queryParams));
      } catch (e) {
        const actions = store.getActions();
        expect(actions[0].type).toBe('ad/DETECTOR_RESULTS_REQUEST');
        expect(reducer(initialDetectorsState, actions[0])).toEqual({
          ...initialDetectorsState,
          requesting: true,
        });
        expect(actions[1].type).toBe('ad/DETECTOR_RESULTS_FAILURE');
        expect(reducer(initialDetectorsState, actions[1])).toEqual({
          ...initialDetectorsState,
          requesting: false,
          errorMessage: 'Something went wrong',
        });
        expect(
          httpMockedClient.get
        ).toHaveBeenCalledWith(
          `..${AD_NODE_API.DETECTOR}/${tempDetectorId}/results`,
          { query: queryParams }
        );
      }
    });
  });
});
