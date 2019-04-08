import gql from "graphql-tag";
import { Query } from "react-apollo";
import Error from "./ErrorMessage";

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <Error error={error} />
        <p>Hey!</p>
      </div>
    )}
  </Query>
);

export default Permissions;

/*
USED THE FOLLOWING ON GRAPHQL PLAYGROUND TO ADD ADMIN PERMISSIONS TO MY USER TO ALLOW FOR INITIAL PERMISSIONS UPDATE PAGE USE

mutation {
  updateUser(
    data: {
      permissions: {set: [USER,ADMIN]}
    }
    where: {
      email: "XXX"
    }
  ) {
    id
    name
  	permissions
  }
}
*/
