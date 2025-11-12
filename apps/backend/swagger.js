import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "The Queue API",
      version: "1.0.0",
      description: "API documentation for The Queue playlist app",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./server.js"],
};

export const specs = swaggerJsdoc(options);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(specs);
