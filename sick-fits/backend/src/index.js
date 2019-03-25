//THIS FILE IS JUST EXPRESS
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
//Expose environment variables file to this index file
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

//spin up server
const server = createServer();

//Use express middleware to handle cookies (JWT)
server.express.use(cookieParser());

//Decode the JWT so we can get userID on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    //put userId on to req for further requests to access
    req.userId = userId;
  }
  next();
});

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
