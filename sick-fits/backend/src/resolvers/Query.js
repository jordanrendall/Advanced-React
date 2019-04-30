const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  //for before using authentication or any extra work on the yoga side, can forward directly to prisma db using forwardTo
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    //check if there is a current user id
    if (!ctx.request.userId) {
      return null; //null allows us to return nothing if no one is logged in
    }
    return ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
  },
  //   async items(parent, args, ctx, info) {
  //     const items = await ctx.db.query.items();
  //     return items;
  //   }
  async users(parent, args, ctx, info) {
    //check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in!');
    }
    //check if user has permissions to query all users
    const allowed = hasPermission(ctx.request.user, [
      'ADMIN',
      'PERMISSIONUPDATE',
    ]);
    //query all users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    //make sure logged in
    if (!ctx.request.userId) throw new Error('You must be logged in!');
    //query current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id },
      },
      info
    );
    //check if they have permissions
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error("You can't see this!");
    }

    //return order
    return order;
  },
};

module.exports = Query;
