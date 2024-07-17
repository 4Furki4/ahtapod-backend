import express from 'express'
import { postRouter } from './routes/post'
import bodyParser from 'body-parser'
export const app = express()

app.use(express.json())
app.use(bodyParser.json())
app.use('/post', postRouter)
const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000`))
