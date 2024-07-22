import express from 'express'
import { validateData } from '../middleware/validationMiddleware'
import { postAddSchema } from '../schemas/postSchemas'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { StatusCodes } from 'http-status-codes'
import prisma from '../prisma/prisma'
import { purifyObject } from '../lib/utils'

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
                username: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
            }
        })
        const postWithUser = {
            ...post,
            user,
        }
        return postWithUser
    }))

    const totalPosts = await prisma.post.count()
    const response = {
        posts: postWithUsers,
        totalPosts,
        totalPages: Math.ceil(totalPosts / Number(limit)),
    }

    res.status(StatusCodes.OK).json(response)
})

postRouter.post('/', ClerkExpressRequireAuth(), validateData(postAddSchema), async (req, res) => {
    const post = purifyObject(req.body) as CreatePostBody

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
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
        }
    })

    const response = {
        ...createdPost,
        user,
    }

    res.status(StatusCodes.CREATED).json(response)
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

    const response = { message: 'Post deleted', postId: id }
    res.status(StatusCodes.OK).json(response)
})


postRouter.put('/:id', ClerkExpressRequireAuth(), validateData(postAddSchema), async (req, res) => {
    const { id } = req.params
    const editedPost = purifyObject(req.body) as EditPostBody
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
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Post not found' })
    }

    const updatedPost = await prisma.post.update({
        where: {
            id
        },
        data: {
            title: editedPost.title,
            content: editedPost.content,
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
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
        }
    })

    const response = {
        ...updatedPost,
        user,
    }

    res.status(StatusCodes.OK).json(response)
})


postRouter.get('/count', async (req, res) => {

    const totalPosts = await prisma.post.count()
    const response = { count: totalPosts }

    res.status(StatusCodes.OK).json(response)
})