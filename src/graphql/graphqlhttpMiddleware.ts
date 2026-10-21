import { graphqlHTTP } from 'express-graphql';
import schema from './schema';

// Setup a controller for the graphqlHTTPMiddleware for intercepting and handling graphql requests
const graphqlHTTPController = (req: any, res: any) => {
    const isDev = process.env.NODE_ENV === 'development';
    const protocol = isDev ? 'ws' : 'wss';
    const host = isDev ? 'localhost:5500' : 'localhost:5500'; //req.headers.host;
    return {
      schema,
      graphiql: {
        subscriptionEndpoint: `${protocol}://${host}/graphql`
      } as any,
      // context: { port: PORT, user: req.user }
      context: {
        req,
        res
      }
    };
  }

  const graphqlHTTPMiddleware = graphqlHTTP(graphqlHTTPController);

export default graphqlHTTPMiddleware;