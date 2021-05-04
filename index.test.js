const az = require('./index');

describe('azlyrics search', () => {
  test('should have lyrics', async (done) => {
    const lyrics = await az.search('justin bieber', 'baby');
    expect(lyrics).toEqual(expect.any(String));
    expect(lyrics.length).toBeGreaterThan(100);
    expect(lyrics.indexOf('You know you love me, I know you care')).toBeGreaterThan(0);
    done();
  });

  test('should not found any result', async () => {
    expect.assertions(1);
    try {
      await az.search('expect', 'assertions try');
    } catch (e) {
      expect(e).toEqual(Error('Does not found any result for the giving artist and track'));
    }
  });

  test('should found result but not match', async () => {
    expect.assertions(1);
    try {
      await az.search('big sean', 'baby');
    } catch (e) {
      expect(e).toEqual(Error('Found results but not match for the giving artist and track'));
    }
  });
});
