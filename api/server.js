require("dotenv").config();
let express = require("express");
let app = express();
const environment = require("./config/environment");
let cors = require("cors");
let path = require("path");
let bodyParser = require("body-parser");
const { expressjwt: expressjwt } = require("express-jwt");
// Import Mongoose
let mongoose = require("mongoose");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to Mongoose and set connection variable
// MongoDB connection
console.log("connection string", environment.mongodb.uri);
console.log("secret", environment.secret);
mongoose.connect(environment.mongodb.uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.Promise = global.Promise;

// On connection error
mongoose.connection.on("error", (error) => {
  console.log("Database error: ", error);
});

// On successful connection
mongoose.connection.on("connected", () => {
  console.log("Connected to database");
});

// addtional configuration when serving Angular SPA (static reource and Anugalr routing)
const allowedExt = [
  ".js",
  ".ico",
  ".css",
  ".png",
  ".jpg",
  ".woff2",
  ".woff",
  ".ttf",
  ".svg",
  ".webmanifest",
  ".html",
  ".txt"
];

//JWT middleware
const jwtMiddleware = expressjwt({
  secret: environment.secret,
  algorithms: ["HS256"],
  getToken: function (req) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      const tokenFromBearer = req.headers.authorization.split(" ")[1];
      return tokenFromBearer;
    } else if (req.query && req.query.token) {
      const tokenFromQs = req.query.token;
      return tokenFromQs;
    }
    return null;
  }
}).unless({
  path: [
    "/api/user/authenticate",
    "/api/users",
    "/index.html",
    "/*.js",
    "/*.css"
  ]
});

// Import routes
let apiRoutes = require("./api-routes");
// Use Api routes in the App
app.use("/api", jwtMiddleware, apiRoutes);

app.get("*", (req, res) => {
  if (allowedExt.filter((ext) => req.url.indexOf(ext) > 0).length > 0) {
    res.sendFile(path.resolve(`public/${req.url}`));
  } else {
    res.sendFile(path.resolve("public/index.html"));
  }
});

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:4200"
  }
});
io.on('connection', (socket) => { 
  console.log('new client connected.');
 });
 global.io = io;


const HOST = "0.0.0.0";
const port = Number(process.env.EXPRESS_PORT) || 3000;

// start server
// Launch app to listen to specified port
server.listen(port, () => {
  console.log(`Running  on http://${HOST}:${port}`);
});

