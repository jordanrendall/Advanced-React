import Link from "next/link";
import CreateItem from "../components/CreateItem";

const Reset = props => (
  <div>
    <p>Reset your password! {props.query.resetToken}</p>
  </div>
);

export default Reset;
