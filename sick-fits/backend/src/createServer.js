const { GraphQLServer } = require("graphql-yoga");
const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const db = require("./db");

function createServer() {
  return new GraphQLServer({
    //Ingests the following schema graphql file
    typeDefs: "src/schema.graphql",
    resolvers: {
      Mutation,
      Query
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    //expose the database to every request
    context: req => ({ ...req, db })
  });
}

module.exports = createServer;
