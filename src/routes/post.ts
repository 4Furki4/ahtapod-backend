import express from 'express'
import { validateData } from '../middleware/validationMiddleware'
import { postAddSchema } from '../schemas/postSchemas'
import prisma from '../../prisma/prisma'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'

export const postRouter = express.Router()

postRouter.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query
    const posts = await prisma.post.findMany({
        take: limit ? Number(limit) : 10,
        skip: page ? (Number(page) - 1) * Number(limit) : 0,
        orderBy: {
            createdAt: 'desc',
        },
    })
    const postWithUsers = await Promise.all(posts.map(async post => {
        const user = await prisma.user.findUnique({
            where: {
                clerkUserId: post.userId,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
            }
        })
        return {
            ...post,
            user,
        }
    }))
    const totalPosts = await prisma.post.count()
    res.json({
        posts: postWithUsers,
        totalPosts,
        totalPages: Math.ceil(totalPosts / Number(limit)),
    })
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