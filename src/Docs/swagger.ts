import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mon API",
      version: "1.0.0",
      description: "Rhopen park by Ahmed",
    },
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    components: {
      schemas: {
        CreateUser: {
          type: "object",
          required: ["professionalEmail", "password", "role"],
          properties: {
            professionalEmail: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "password123",
            },
            role: {
              type: "string",
              enum: ["Employer", "Manager", "Administrator", "Director", "Logistician"],
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", format: "email", example: "Ahmed@gmail.com" },
            role: { type: "string", example: "Employer" },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
