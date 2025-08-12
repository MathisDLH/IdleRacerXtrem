import { PurchaseError } from './PurchaseError';

describe('PurchaseError', () => {
  it('creates expected message', () => {
    const err = new PurchaseError('10', '20');
    expect(err.message).toBe('you need 20 but you have 10');
  });
});
