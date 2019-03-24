//THIS FILE IS JUST EXPRESS
const cookieParser = require("cookie-parser");
//Expose environment variables file to this index file
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

//spin up server
const server = createServer();

//Use express middleware to handle cookies (JWT)
server.express.use(cookieParser());

//TODO: use express middleware to populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is now running on port http:localhost:${deets.port}`);
  }
);
