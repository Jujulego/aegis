import { aegis } from 'src';

// Tests
describe('aegis', () => {
  it('should return a reference containing blade\'s result', async () => {
    const ref = aegis((id: number) => ({
      id,
      data: 'life'
    }));

    await expect(ref.refresh(42)).resolves.toEqual({
      id: 42,
      data: 'life',
    });
  });
});
