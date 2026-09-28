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
            id: { type: "integer"},
            email: { type: "string", format: "email"},
            role: { type: "string", example: "Employer" },
          },
        },
        CreateRequest: {
          type: "object",
          properties: {
            description: { type: "string"},
            creationDate: { type: "string", format: "date-time"},
          },
        },
        UpdateRequest: {
          allOf: [{ $ref: "#/components/schemas/CreateRequest" }],
        },
        Request: {
          type: "object",
          properties: {
            idRequest: { type: "integer"},
            description: { type: "string"},
            creationDate: { type: "string", format: "date-time",},
          },
        },
        CreateLogisticService: {
          type: "object",
          required: ["idRequest", "professionalEmail", "password"],
          properties: {
            idRequest: { type: "integer"},
            professionalEmail: { type: "string", format: "email"},
            password: { type: "string", format: "password"},
          },
        },
        UpdateLogisticService: {
          type: "object",
          properties: {
            idRequest: { type: "integer"},
            professionalEmail: { type: "string", format: "email" },
            password: { type: "string", format: "password"},
          },
        },
        LogisticService: {
          type: "object",
          properties: {
            idLogisticService: { type: "integer"},
            idRequest: { type: "integer"},
            professionalEmail: { type: "string", format: "email" },
          },
        },
        CreateSubmission: {
          type: "object",
          required: ["idUser", "idRequest"],
          properties: {
            idUser: { type: "integer"},
            idRequest: { type: "integer"},
          },
        },
        Submission: {
          type: "object",
          properties: {
            idUser: { type: "integer"},
            idRequest: { type: "integer"},
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
