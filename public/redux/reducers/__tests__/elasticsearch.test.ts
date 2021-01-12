import { MockStore } from 'redux-mock-store';
import httpMockedClient from '../../../../test/mocks/httpClientMock';
import { BASE_NODE_API_PATH } from '../../../../utils/constants';
import { mockedStore } from '../../utils/testUtils';
import reducer, {
  getAliases,
  getIndices,
  getMappings,
  initialState,
  searchES,
} from '../elasticsearch';

describe('elasticsearch reducer actions', () => {
  let store: MockStore;
  beforeEach(() => {
    store = mockedStore();
  });
  describe('getIndices', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const indices = [
        { index: 'hello', health: 'green' },
        { index: 'world', health: 'yellow' },
      ];
      httpMockedClient.get = jest
        .fn()
        .mockResolvedValue({ ok: true, response: { indices } });
      await store.dispatch(getIndices());
      const actions = store.getActions();

      expect(actions[0].type).toBe('elasticsearch/GET_INDICES_REQUEST');
      expect(reducer(initialState, actions[0])).toEqual({
        ...initialState,
        requesting: true,
      });
      expect(actions[1].type).toBe('elasticsearch/GET_INDICES_SUCCESS');
      expect(reducer(initialState, actions[1])).toEqual({
        ...initialState,
        requesting: false,
        indices,
      });
      expect(
        httpMockedClient.get
      ).toHaveBeenCalledWith(`..${BASE_NODE_API_PATH}/_indices`, {
        query: { index: '' },
      });
    });
    test('should invoke [REQUEST, FAILURE]', async () => {
      httpMockedClient.get = jest.fn().mockRejectedValue({
        ok: false,
        error: 'Something went wrong',
      });
      try {
        await store.dispatch(getIndices());
      } catch (e) {
        const actions = store.getActions();
        expect(actions[0].type).toBe('elasticsearch/GET_INDICES_REQUEST');
        expect(reducer(initialState, actions[0])).toEqual({
          ...initialState,
          requesting: true,
        });
        expect(actions[1].type).toBe('elasticsearch/GET_INDICES_FAILURE');
        expect(reducer(initialState, actions[1])).toEqual({
          ...initialState,
          requesting: false,
          errorMessage: 'Something went wrong',
        });
        expect(httpMockedClient.get).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/_indices`,
          {
            query: { index: '' },
          }
        );
      }
    });
  });
  describe('getAliases', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const aliases = [{ index: 'hello', alias: 'world' }];
      httpMockedClient.get = jest
        .fn()
        .mockResolvedValue({ ok: true, response: { aliases } });
      await store.dispatch(getAliases());
      const actions = store.getActions();

      expect(actions[0].type).toBe('elasticsearch/GET_ALIASES_REQUEST');
      expect(reducer(initialState, actions[0])).toEqual({
        ...initialState,
        requesting: true,
      });
      expect(actions[1].type).toBe('elasticsearch/GET_ALIASES_SUCCESS');
      expect(reducer(initialState, actions[1])).toEqual({
        ...initialState,
        requesting: false,
        aliases,
      });
      expect(httpMockedClient.get).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/_aliases`,
        {
          query: { alias: '' },
        }
      );
    });
    test('should invoke [REQUEST, FAILURE]', async () => {
      httpMockedClient.get = jest.fn().mockRejectedValue({
        ok: false,
        error: 'Something went wrong',
      });
      try {
        await store.dispatch(getAliases());
      } catch (e) {
        const actions = store.getActions();
        expect(actions[0].type).toBe('elasticsearch/GET_ALIASES_REQUEST');
        expect(reducer(initialState, actions[0])).toEqual({
          ...initialState,
          requesting: true,
        });
        expect(actions[1].type).toBe('elasticsearch/GET_ALIASES_FAILURE');
        expect(reducer(initialState, actions[1])).toEqual({
          ...initialState,
          requesting: false,
          errorMessage: 'Something went wrong',
        });
        expect(httpMockedClient.get).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/_aliases`,
          {
            query: { alias: '' },
          }
        );
      }
    });
  });
  describe('getMappings', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const mappings = {
        kibana: {
          mappings: {
            properties: {
              field_1: { type: 'string' },
              field_2: { type: 'long' },
            },
          },
        },
      };
      httpMockedClient.get = jest
        .fn()
        .mockResolvedValue({ ok: true, response: { mappings } });
      await store.dispatch(getMappings());
      const actions = store.getActions();
      expect(actions[0].type).toBe('elasticsearch/GET_MAPPINGS_REQUEST');
      expect(reducer(initialState, actions[0])).toEqual({
        ...initialState,
        requesting: true,
      });
      expect(actions[1].type).toBe('elasticsearch/GET_MAPPINGS_SUCCESS');
      expect(reducer(initialState, actions[1])).toEqual({
        ...initialState,
        requesting: false,
        dataTypes: {
          string: ['field_1'],
          long: ['field_2'],
        },
      });
      expect(httpMockedClient.get).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/_mappings`,
        {
          query: { index: '' },
        }
      );
    });
    test('should invoke [REQUEST, FAILURE]', async () => {
      httpMockedClient.get = jest.fn().mockRejectedValue({
        ok: false,
        error: 'Something went wrong',
      });
      try {
        await store.dispatch(getMappings());
      } catch (e) {
        const actions = store.getActions();
        expect(actions[0].type).toBe('elasticsearch/GET_MAPPINGS_REQUEST');
        expect(reducer(initialState, actions[0])).toEqual({
          ...initialState,
          requesting: true,
        });
        expect(actions[1].type).toBe('elasticsearch/GET_MAPPINGS_FAILURE');
        expect(reducer(initialState, actions[1])).toEqual({
          ...initialState,
          requesting: false,
          errorMessage: 'Something went wrong',
        });
        expect(httpMockedClient.get).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/_mappings`,
          {
            query: { index: '' },
          }
        );
      }
    });
  });

  describe('searchES', () => {
    test('should invoke [REQUEST, SUCCESS]', async () => {
      const requestData = {
        query: {
          match: { match_all: {} },
        },
        index: 'test-index',
      };
      httpMockedClient.post = jest.fn().mockResolvedValue({
        ok: true,
        response: { hits: { hits: [] } },
      });
      await store.dispatch(searchES(requestData));
      const actions = store.getActions();
      expect(actions[0].type).toBe('elasticsearch/SEARCH_ES_REQUEST');
      expect(reducer(initialState, actions[0])).toEqual({
        ...initialState,
        requesting: true,
      });
      expect(actions[1].type).toBe('elasticsearch/SEARCH_ES_SUCCESS');
      expect(reducer(initialState, actions[1])).toEqual({
        ...initialState,
        requesting: false,
        searchResult: {
          hits: { hits: [] },
        },
      });
      expect(httpMockedClient.post).toHaveBeenCalledWith(
        `..${BASE_NODE_API_PATH}/_search`,
        {
          body: JSON.stringify(requestData),
        }
      );
    });
    test('should invoke [REQUEST, FAILURE]', async () => {
      const requestData = {
        query: {
          match: { match_all: {} },
        },
        index: 'test-index',
      };
      httpMockedClient.post = jest.fn().mockRejectedValue({
        ok: false,
        error: 'Something went wrong',
      });
      try {
        await store.dispatch(searchES(requestData));
      } catch (e) {
        const actions = store.getActions();
        expect(actions[0].type).toBe('elasticsearch/SEARCH_ES_REQUEST');
        expect(reducer(initialState, actions[0])).toEqual({
          ...initialState,
          requesting: true,
        });
        expect(actions[1].type).toBe('elasticsearch/SEARCH_ES_FAILURE');
        expect(reducer(initialState, actions[1])).toEqual({
          ...initialState,
          requesting: false,
          errorMessage: 'Something went wrong',
        });
        expect(httpMockedClient.post).toHaveBeenCalledWith(
          `..${BASE_NODE_API_PATH}/_search`,
          {
            body: JSON.stringify(requestData),
          }
        );
      }
    });
  });
  describe('getPrioritizedIndices', () => {});
});
