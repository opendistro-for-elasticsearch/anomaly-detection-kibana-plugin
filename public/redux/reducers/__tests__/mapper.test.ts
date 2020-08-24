import { getPathsPerDataType } from '../mapper';

describe('mapper', () => {
  describe('getPathsPerDataType', () => {
    test('has fields', async () => {
      const mappings = {
        test_index: {
          mappings: {
            properties: {
              test: {
                properties: {
                  a: {
                    properties: {
                      b: {
                        type: 'keyword',
                        eager_global_ordinals: true,
                        fields: {
                          raw: {
                            type: 'integer',
                          },
                        },
                      },
                    },
                  },
                },
              },
              timestamp: {
                type: 'date',
                format: 'strict_date_time||epoch_millis',
              },
              value: {
                type: 'float',
              },
            },
          },
        },
      };
      const pathsPerDataType = getPathsPerDataType(mappings);
      console.log(pathsPerDataType);

      expect(pathsPerDataType).toEqual({
        keyword: ['test.a.b'],
        integer: ['test.a.b.raw'],
        date: ['timestamp'],
        float: ['value'],
      });
    });
  });
});
