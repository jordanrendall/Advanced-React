import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import User from './User';
import OrderItemStyles from './styles/OrderItemStyles';
import styled from 'styled-components';

const OrderUl = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
`;

const ORDERS_QUERY = gql`
  query ORDERS_QUERY {
    orders {
      id
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
      total
      charge
      updatedAt
      createdAt
    }
  }
`;

const Orders = props => (
  <User>
    {({ data: { me }, loading }) => {
      if (loading) return <p>Loading</p>;
      return (
        <Query query={ORDERS_QUERY} variables={{ userId: me.id }}>
          {({ data: { orders }, loading, error }) => {
            if (error) return <Error error={error} />;
            if (loading) return <p>Loading Orders...</p>;
            console.log(orders);
            return (
              <OrderUl>
                {orders.map(order => (
                  <div key={order.id}>
                    <span>Order Date:</span>
                    <span>{order.createdAt}</span>

                    <div>
                      {order.items.map(item => (
                        <div key={item.id}>
                          <span>Item:</span>
                          <span>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </OrderUl>
            );
          }}
        </Query>
      );
    }}
  </User>
);

export default Orders;
