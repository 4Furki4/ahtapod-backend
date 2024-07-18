import 'dotenv/config'
import express, { Application } from 'express'
import { postRouter } from './routes/post'
import bodyParser from 'body-parser'
import cors from 'cors'
import {
  ClerkExpressRequireAuth,
  StrictAuthProp,
} from '@clerk/clerk-sdk-node';


const port = process.env.PORT || 3001;

const app: Application = express();



declare global {
  namespace Express {
    interface Request extends StrictAuthProp { }
  }
}
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use('/api/post', ClerkExpressRequireAuth(), postRouter)
const server = app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}`))