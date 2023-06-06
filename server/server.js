require("dotenv").config();
//  Implement the Apollo Server and apply it to the Express server as middleware.
const express = require("express");
const path = require("path");
// import ApolloServer
const { ApolloServer } = require("apollo-server-express");
// middleware function for authentication
const { authMiddleware } = require("./utils/auth");
// import typeDefs and resolvers
const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const app = express();
const PORT = process.env.PORT || 3001;
// create a new Apollo server and pass in our schema data
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context will be used for the the token authentication
  context: authMiddleware,
});

// integrate Apollo server with the Express application as middleware
server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// wildcard get route for the server. If we make a get request
// to any location on the server that doesn't have an explicit
// route defined, respond with the production -ready react front-end code
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
