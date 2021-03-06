import Link from "next/link";
import CreateItem from "../components/CreateItem";
import Reset from "../components/Reset";

const ResetPage = props => (
  <div>
    <p>Reset your password! {props.query.resetToken}</p>
    <Reset resetToken={props.query.resetToken} />
  </div>
);

export default ResetPage;
