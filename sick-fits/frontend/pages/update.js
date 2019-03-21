import Link from "next/link";
import UpdateItem from "../components/UpdateItem";

//props are available to us since this.props was exposed
//and props can be used without this because it is stateless component
//further, props can be destructured into query since that's all we need
const Update = ({ query }) => (
  <div>
    {/* this.props.query is exposed in _app.js  */}
    <UpdateItem id={query.id} />
  </div>
);

export default Update;
