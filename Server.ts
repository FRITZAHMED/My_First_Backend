import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './src/Docs/swagger.ts'

const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`Swagger disponible sur http://localhost:${port}/api-docs`)
});