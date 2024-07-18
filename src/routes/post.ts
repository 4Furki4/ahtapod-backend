import express from 'express'
import { validateData } from '../middleware/validationMiddleware'
import { postAddSchema } from '../schemas/postSchemas'
import prisma from '../../prisma/prisma'
import { RequireAuthProp } from '@clerk/clerk-sdk-node'
import { clerkClient } from '../lib/clerk'

export const postRouter = express.Router()

postRouter.get('/', (req, res) => {
    res.send('Hello World!')
})

postRouter.post('/', validateData(postAddSchema), async (req, res) => {
    const post = req.body
    const createdPost = await prisma.post.create({
        data: {
            title: post.title,
            content: post.content,
            userId: req.auth!.userId,
        }
    })
    res.status(201).json(createdPost)
})