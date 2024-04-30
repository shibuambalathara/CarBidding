import "dotenv/config";
import dotenv from 'dotenv';
import { config } from "@keystone-6/core";
import { withAuth, session } from "./src/application/auth";
import { extendGraphqlSchema, lists, router } from "./src/application/schema";
import { extendHttpServer } from './src/application/graphqlRoutes/websocket';

// const baseUrl = process.env.BASE_URL || "http://localhost:3000";
 dotenv.config();

export default config(
  withAuth({
    db: {
      provider: "postgresql",
      url:
         process.env.DATABASE_URL ||
        "postgresql://postgres:123@localhost:5432/automax1",
    },
    lists: lists,
    ui: {
      isAccessAllowed: (context) => !!context.session?.data,
    },
    session,
    server: {
      cors: {
        origin: [
          "https://equitas-admin.vercel.app/",
          "https://equitas-liard.vercel.app",
          "https://localhost:3000",
          "http://localhost:3001",
          "http://localhost:3002",
          "https://autobse.com",
          "https://*.autobse.com",
          "https://www.autobse.com",
          "https://api-dev.autobse.com",
          "https://studio.apollographql.com",
          "https://auto-bse.vercel.app",
          "https://*.vercel.app",
          "https://autobse.vercel.app",
          "https://autobse-braineo.vercel.app",
          "https://admin-dashboard-theta-three.vercel.app"
        ],
        credentials: true,
      },
      maxFileSize: 200 * 1024 * 1024,
      healthCheck: true,
      extendExpressApp: router,
      extendHttpServer: extendHttpServer,
    },
    extendGraphqlSchema,
    graphql: {
      playground: "apollo", //process.env.NODE_ENV !== 'production' ? 'apollo' : false
      // debug: process.env.NODE_ENV !== 'production',
      // apolloConfig: {
      //   debug: true,
      // },
       apolloConfig: { introspection: true }
    },
    storage:
      {
       local_images: {
        kind: "local",
        type: "image",
        // The URL that is returned in the Keystone GraphQL API
        generateUrl: (path) => `/images${path}`,
        serverRoute: {
          path: "/images",
        },
        storagePath: "public/images",
      },
      local_files: {
        kind: "local",
        type: "file",
        // The URL that is returned in the Keystone GraphQL API
        generateUrl: (path) => `/files/excel${path}`,
        serverRoute: {
          path: "/files/excel",
        },
        storagePath: "public/files/excel",
      },
  
      my_s3_images: {
        kind: 's3',
        type: 'image',
      
        bucketName: process.env.BUCKET_NAME,
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        
      },
      my_s3_files: {
        kind: 's3', 
        type: 'file',
        bucketName: process.env.BUCKET_NAME,
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    }
  })
);
