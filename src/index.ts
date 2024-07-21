import 'dotenv/config'
import express, { Application, NextFunction } from 'express'
import { postRouter } from './routes/post'
import bodyParser from 'body-parser'
import cors from 'cors'
import {
  ClerkExpressRequireAuth,
  StrictAuthProp,
} from '@clerk/clerk-sdk-node';
import { userRouter } from './routes/user'


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
app.use('/api/posts', postRouter)
app.use('/api/users', userRouter)
// @ts-ignore
app.use((
  err: any,
  req: express.Request,
  res: express.Response,
  next: NextFunction
) => {
  console.error(err.stack)
  res.status(401).json({ error: 'Not Authorized' })
});
const server = app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}`))