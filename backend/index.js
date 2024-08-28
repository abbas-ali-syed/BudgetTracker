import express from "express";
import http from "http";
import cors from 'cors';
import { ApolloServer } from "@apollo/server"
import mergedResolvers from './resolvers/index.js'
import mergedTypeDefs from "./typeDefs/index.js"
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
const app=express();
dotenv.config();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs:mergedTypeDefs,
  resolvers:mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})
 
 
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
	"/",
	cors(),
	express.json(),
	// expressMiddleware accepts the same arguments:
	// an Apollo Server instance and optional configuration options
	expressMiddleware(server, {
		context: async ({ req }) =>{ req},
	})
);

// npm run build will build your frontend app, and it will the optimized version of your app




// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();
console.log(`🚀 Server ready at http://localhost:4000/graphql`);

