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
    ctx.db.mutation.createItem;
    item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
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
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    //1. find item
    const item = await ctx.db.query.item({ where }, `{id title}`);
    //2. check if they own or have permissions
    // TODO
    //3. delete it
    return await ctx.db.mutation.deleteItem({ where }, info);
  }
};

module.exports = Mutations;
