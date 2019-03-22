import Link from "next/link";
import SingleItem from "../components/SingleItem";

//dev tools showed that <Item /> has access to props but SingleItem does not
//Therefore, pass via props as below
const Item = props => (
  <div>
    <SingleItem id={props.query.id} />
  </div>
);

export default Item;
