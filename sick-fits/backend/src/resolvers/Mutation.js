const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

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
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    //create JWT for the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //set the jwt as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true, //so no access via Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
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
      throw new Error("Invalid password!");
    }
    //generate jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //set cookie with token
    ctx.response.cookie("token", token, {
      httpOnly: true, //so no access via Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
    });
    //return user
    return user;
  },
  async signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },
  async requestReset(parent, args, ctx, info) {
    //check if real user
    const user = await ctx.db.query.user({ where: { email: args.email } });

    if (!user) {
      throw new Error(`No such user with email ${args.email}`);
    }
    //set reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    //email that reset token
    console.log(res);
    return { message: "Thanks!" };
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
      throw new Error("Passwords do not match");
    }
    //check if legit reset token
    const [userTokenExists] = await ctx.db.query.users({
      where: { resetToken, resetTokenExpiry_gte: Date.now() - 3600000 }
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
        resetTokenExpiry: null
      }
    });
    //generate jwt
    const newJWT = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    //set jwt cookie
    ctx.response.cookie("token", newJWT, {
      httpOnly: true, //so no access via Javascript
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
    });
    //return user
    return updatedUser;
  }
};

module.exports = Mutations;
