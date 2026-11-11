import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import graphqlHTTPMiddleware from './graphql/graphqlhttpMiddleware';


const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080" ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/graphql', graphqlHTTPMiddleware);

export default app;