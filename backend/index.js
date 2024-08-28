import express from "express";
import http from "http";
import cors from 'cors';

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { buildContext } from "graphql-passport";

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
const MongoDBStore= connectMongo(session);
const store = new MongoDBStore({
	uri:process.env.MONGO_URI,
	collection:"sessions",
})
store.on("error",(err)=>console.log(err));
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false, // this option specifies whether to save the session to the store on every request
		saveUninitialized: false, // option specifies whether to save uninitialized sessions
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			httpOnly: true, // this option prevents the Cross-Site Scripting (XSS) attacks
		},
		store: store,
	})
);

app.use(passport.initialize());
app.use(passport.session());

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
	cors({
		origin: "http://localhost:3000",
		credentials:true,
	}),
	express.json(),
	// expressMiddleware accepts the same arguments:
	// an Apollo Server instance and optional configuration options
	expressMiddleware(server, {
		context: async ({ req,res }) =>buildContext({ req,res}),
	})
);

// npm run build will build your frontend app, and it will the optimized version of your app




// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();
console.log(`🚀 Server ready at http://localhost:4000/graphql`);

