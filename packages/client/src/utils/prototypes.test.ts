describe('Number', () => {
  describe('inRange', () => {
    it('is in the middle', () => {
      const num = 5;
      expect(num.inRange(0, 10)).toBeTruthy();
    });

    it('is in the min inclusive', () => {
      const num = 5;
      expect(num.inRange(5, 10)).toBeTruthy();
    });

    it('is in the min non-inclusive', () => {
      const num = 5;
      expect(num.inRange(5, 10, false)).toBeFalsy();
      expect(num.inRange(4, 10, false)).toBeTruthy();
    });

    it('is in the max inclusive', () => {
      const num = 5;
      expect(num.inRange(0, 5)).toBeTruthy();
    });

    it('is in the max non-inclusive', () => {
      const num = 5;
      expect(num.inRange(0, 5, false)).toBeFalsy();
      expect(num.inRange(0, 6, false)).toBeTruthy();
    });

    it("reverses min-max if values don't make sense", () => {
      const num = 5;
      expect(num.inRange(10, 5)).toBeTruthy();
      expect(num.inRange(6, 0)).toBeTruthy();
    });
  });
});
