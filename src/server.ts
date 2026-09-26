import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './Docs/swagger.js';
import userRouter from './routes/user_routes.js';

const app = express();
const port = 4000;

app.use(express.json());
app.use('/api', userRouter);
app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`Swagger disponible sur http://localhost:${port}/api-docs`);
});

export default app;