import express from 'express'
import { validateData } from '../middleware/validationMiddleware'
import { postAddSchema } from '../schemas/postSchemas'
import prisma from '../../prisma/prisma'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

export const postRouter = express.Router()

postRouter.get('/', async (req, res) => {
    const { page, limit } = req.query
    const posts = await prisma.post.findMany({
        take: limit ? Number(limit) : 10,
        skip: page ? (Number(page) - 1) * (limit ? Number(limit) : 10) : 0,
        orderBy: {
            createdAt: 'desc',
        },
    })
    res.json(posts)
})

postRouter.post('/', ClerkExpressRequireAuth(), validateData(postAddSchema), async (req, res) => {
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