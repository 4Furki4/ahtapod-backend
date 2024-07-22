import express from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from '../prisma/prisma'
export const userRouter = express.Router()

userRouter.get('/count', async (req, res) => {
    const count = await prisma.user.count()
    const response = { count }
    res.status(StatusCodes.OK).json(response)
})