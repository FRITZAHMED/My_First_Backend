declare module 'swagger-jsdoc' {
  interface Options {
    definition: Record<string, unknown>;
    apis: string[];
  }

  interface SwaggerJSDoc {
    (options: Options): Record<string, unknown>;
    Options: Options;
  }

  const swaggerJSDoc: SwaggerJSDoc;
  export default swaggerJSDoc;
}