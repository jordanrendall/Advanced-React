const { forwardTo } = require("prisma-binding");

const Query = {
  //for before using authentication or any extra work on the yoga side, can forward directly to prisma db using forwardTo
  items: forwardTo("db")
  //   async items(parent, args, ctx, info) {
  //     const items = await ctx.db.query.items();
  //     return items;
  //   }
};

module.exports = Query;
