import express from 'express'
import { validateData } from '../middleware/validationMiddleware'
import { postAddSchema } from '../schemas/postSchemas'
import prisma from '../../prisma/prisma'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { StatusCodes } from 'http-status-codes'

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
    res.status(StatusCodes.OK).json({
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
    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: createdPost.userId,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
        }
    })
    res.status(StatusCodes.CREATED).json(
        {
            ...createdPost,
            user,
        }
    )
})

postRouter.delete('/:id', ClerkExpressRequireAuth(), async (req, res) => {
    const { id } = req.params
    const role = req.auth.sessionClaims.org_role
    if (role !== 'org:manager') {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not authorized to delete this post' })
    }
    const post = await prisma.post.findUnique({
        where: {
            id
        }
    })
    if (!post) {
        return res.status(404).json({ message: 'Post not found' })
    }
    await prisma.post.delete({
        where: {
            id
        }
    })
    res.status(StatusCodes.OK).json({ message: 'Post deleted', postId: id })
})


postRouter.put('/:id', ClerkExpressRequireAuth(), validateData(postAddSchema), async (req, res) => {
    const { id } = req.params
    const role = req.auth.sessionClaims.org_role
    if (role !== 'org:manager') {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'You are not authorized to edit this post' })
    }
    const post = await prisma.post.findUnique({
        where: {
            id
        }
    })
    if (!post) {
        return res.status(404).json({ message: 'Post not found' })
    }
    const updatedPost = await prisma.post.update({
        where: {
            id
        },
        data: {
            title: req.body.title,
            content: req.body.content,
            updatedAt: new Date(),
        }
    })
    const user = await prisma.user.findUnique({
        where: {
            clerkUserId: updatedPost.userId,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
        }
    })
    res.status(StatusCodes.OK).json(
        {
            ...updatedPost,
            user,
        }
    )
})