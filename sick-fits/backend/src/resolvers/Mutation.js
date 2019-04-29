const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const Mutations = {
  //   createDog(parent, args, ctx, info) {
  //     global.dogs = global.dogs || [];
  //     console.log(args);
  //     const newDog = { name: args.name };
  //     global.dogs.push(newDog);
  //     return newDog;
  //   }
  async createItem(parent, args, ctx, info) {
    //TODO: check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    ctx.db.mutation.createItem;
    item = await ctx.db.mutation.createItem(
      {
        data: {
          //This is how we create a relationship between data
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
      },
      info
    );
    return item;
  },

  async updateItem(parent, args, ctx, info) {
    //copy updates
    const updates = { ...args };
    //remove ID
    delete updates.id;

    //ctx is context in request, db is exposing prisma database to ourselves
    //then have access to all mutations in our generated file, including updateItem
    //info is passed so that updateItem function knows what to return
    return await ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    //1. find item
    const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
    //2. check if they own or have permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );

    if (!ownsItem && hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }
    //3. delete it
    return await ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    //to lowercase their email
    args.email = args.email.toLowerCase();
    //hash their password
    //we give length of 10 to have bcrypt create a salt for us, then it is much harder for anyone to guess the salt
    const password = await bcrypt.hash(args.password, 10);
    //create user in db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password, //destructuring
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    //create JWT for the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true, //so no access via Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    });

    return user;
    /*
    hash('dogs123') // a;sldkfj;alsdkjfpio
    hash('dogs122') // oiuweporuq;rjwemkmr
    hash('dogs123') === a;sldkfj;alsdkjfpio --> true!
    */
  },
  async signin(parent, { email, password }, ctx, info) {
    //check if user with email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    //check if password correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password!');
    }
    //generate jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //set cookie with token
    ctx.response.cookie('token', token, {
      httpOnly: true, //so no access via Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    });
    //return user
    return user;
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  async requestReset(parent, args, ctx, info) {
    //check if real user
    const user = await ctx.db.query.user({ where: { email: args.email } });

    if (!user) {
      throw new Error(`No such user with email ${args.email}`);
    }
    //set reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    //email that reset token
    const mailRes = await transport.sendMail({
      from: 'thomasjrendall@gmail.com',
      to: user.email,
      subject: 'Your password reset email',
      html: makeANiceEmail(
        `Your password reset token is here:\n\n <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}
        ">Click here to reset your password!</a>`
      ),
    });

    //return message
    return { message: 'Thanks!' };
  },
  async resetPassword(
    parent,
    { resetToken, password, confirmPassword },
    ctx,
    info
  ) {
    //check if passwords match
    const passwordMatch = password === confirmPassword;
    if (!passwordMatch) {
      throw new Error('Passwords do not match');
    }
    //check if legit reset token
    const [userTokenExists] = await ctx.db.query.users({
      where: { resetToken, resetTokenExpiry_gte: Date.now() - 3600000 },
    });
    if (!userTokenExists) {
      throw new Error(`Invalid reset token.`);
    }
    //hash new password
    const newPassword = await bcrypt.hash(password, 10);
    //save new password to user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: userTokenExists.email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    //generate jwt
    const newJWT = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    //set jwt cookie
    ctx.response.cookie('token', newJWT, {
      httpOnly: true, //so no access via Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365, //1 year cookie
    });
    //return user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    //Check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    //query current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    );
    //check if they have permisisons to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    //update permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: { set: args.permissions },
        },
        where: {
          id: args.userId,
        },
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    //make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged in!');
    }
    //query users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });

    //check if item is already in the cart and increment by 1 if is
    if (existingCartItem) {
      console.log('This item is already in the cart');
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info
      );
    }
    //if not, create fresh cart item
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId },
          },
          item: {
            connect: { id: args.id },
          },
        },
      },
      info
    );
  },
  async removeCartItem(parent, args, ctx, info) {
    //find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{ id, user {id}}`
    );

    if (!cartItem) throw new Error('Item not found!');

    //make sure they own cart item
    if (cartItem.user.id !== ctx.request.userId)
      throw new Error('You do not own this item!');

    //delete the cart item
    return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info);
  },
  async createOrder(parent, args, ctx, info) {
    //query current user and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId)
      throw new Error('You must be signed in to complete this order');
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
          id 
          name 
          email 
          cart { 
            id 
            quantity 
            item { 
              title 
              price 
              id 
              description 
              image
              largeImage
            }
          }
        }`
    );
    //recalculate total for price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.quantity * cartItem.item.price,
      0
    );
    //create stripe charge
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    //convert cartItems to orderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      };
      delete orderItem.id;
      return orderItem;
    });
    //create order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    });
    //clean up - clear cart, delete cartitems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    });
    //return order to client
    return order;
  },
};

module.exports = Mutations;
