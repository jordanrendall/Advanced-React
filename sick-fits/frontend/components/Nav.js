import React from 'react';
import { Mutation } from 'react-apollo';
import { TOGGLE_CART_MUTATION } from './Cart';
import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';
import CartCount from './CartCount';

export default function Nav() {
  return (
    //put user render component as high as possible to allow toggling of display of links
    <User>
      {({ data: { me } }) => (
        <NavStyles data-test='nav'>
          <Link href='/items'>
            <a>Shop</a>
          </Link>
          {me && (
            //react fragment invisible
            <>
              <Link href='/sell'>
                <a>Sell</a>
              </Link>
              <Link href='/orders'>
                <a>Orders</a>
              </Link>
              <Link href='/me'>
                <a>Me</a>
              </Link>
              <Signout />
              <Mutation mutation={TOGGLE_CART_MUTATION}>
                {toggleCart => (
                  <button onClick={toggleCart}>
                    My Cart
                    <CartCount
                      count={me.cart.reduce((count, currentItem) => {
                        return count + currentItem.quantity;
                      }, 0)}
                    />
                  </button>
                )}
              </Mutation>
            </>
          )}

          {!me && (
            <Link href='/signup'>
              <a>Sign In</a>
            </Link>
          )}
        </NavStyles>
      )}
    </User>
  );
}
