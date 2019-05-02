function Person(name, foods) {
  this.name = name;
  this.foods = foods;
}

Person.prototype.fetchFavFoods = function() {
  return new Promise((resolve, reject) => {
    //Simulate API
    setTimeout(() => resolve(this.foods), 2000);
  });
};

describe('mocking learning', () => {
  it('mocks a reg function', () => {
    const fetchDogs = jest.fn();
    fetchDogs();
    fetchDogs('snickers');
    expect(fetchDogs).toHaveBeenCalled();
    expect(fetchDogs).toHaveBeenCalledWith('snickers');
    expect(fetchDogs).toHaveBeenCalledTimes(2);
  });

  it('can create a person', () => {
    const me = new Person('Jordan', ['pasta']);
    expect(me.name).toBe('Jordan');
  });

  it('can fetch foods', async () => {
    const me = new Person('Jordan', ['pasta']);
    //mock favfoods function
    me.fetchFavFoods = jest.fn().mockResolvedValue(['sushi']);
    const favFoods = await me.fetchFavFoods();
    console.log(favFoods);
    expect(favFoods).toContain('sushi');
  });
});
