describe('sample test 101', () => {
  // test() - same as it()
  it('works as expected', () => {
    const age = 100;
    expect(1).toEqual(1);
    expect(age).toEqual(100);
  });

  it('handles ranges just fine', () => {
    const age = 200;
    expect(age).toBeGreaterThan(100);
  });

  //   it.skip('makes a list of dog names', () => {
  //xit same as it.skip. Can also use it.only or fit - focus it
  xit('makes a list of dog names', () => {
    const dogs = ['snickers', 'hugo'];
    expect(dogs).toEqual(dogs);
    expect(dogs).toContain('snickers');
    expect(dogs).toContain('hugo');
  });
});
