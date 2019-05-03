import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CartCount from '../components/CartCount';

describe('<CartCount/>', () => {
  it('renders', () => {
    shallow(<CartCount count={10} />);
  });
  it('matches the snapshot', () => {
    const wrapper = shallow(<CartCount count={11} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
  it('updates via props', () => {
    const wrapper = shallow(<CartCount count={50} />);
    //mount simulates as if browser - shallow only goes one level deep
    //mounting preferred because closest to actual environment
    //const wrapper = mount(<CartCount count={50} />);
    //console.log(wrapper.debug());
    //return;
    expect(toJSON(wrapper)).toMatchSnapshot();
    wrapper.setProps({ count: 10 });
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
