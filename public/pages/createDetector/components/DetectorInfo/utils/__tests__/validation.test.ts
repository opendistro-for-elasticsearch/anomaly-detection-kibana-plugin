import chance from 'chance';
import { validateDetectorDesc } from '../validation';

describe('validations', () => {
  describe('validateDetectorDesc', () => {
    const descriptionGenerator = new chance('seed');
    test('should throw size limit if exceed  400', () => {
      expect(
        validateDetectorDesc(descriptionGenerator.paragraph({ length: 500 }))
      ).toEqual('Description Should not exceed 400 characters');
    });
    test('should return undefined if not empty', () => {
      expect(validateDetectorDesc('This is description')).toBeUndefined();
    });
  });
});
