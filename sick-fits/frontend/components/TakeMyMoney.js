import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends React.Component {
  onToken = res => {
    console.log('On token called');
    console.log(res.id);
  };
  render() {
    return (
      <User>
        {({ data: { me } }) =>
          me.cart.length ? (
            <StripeCheckout
              //ALWAYS NEED TO SEND CENTS TO STRIPE
              amount={calcTotalPrice(me.cart)}
              name='Sick Fits'
              description={`Order of ${totalItems(me.cart)} items!`}
              image={me.cart[0].item && me.cart[0].item.image}
              stripeKey={process.env.STRIPE_SECRET}
              currency='CAD'
              email={me.email}
              token={res => this.onToken(res)}
            >
              {this.props.children}
            </StripeCheckout>
          ) : (
            <p>No items</p>
          )
        }
      </User>
    );
  }
}

export default TakeMyMoney;
