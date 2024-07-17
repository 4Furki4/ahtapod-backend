import express from 'express'

export const postRouter = express.Router()

postRouter.get('/', (req, res) => {
    res.send('Hello World!')
})

postRouter.post('/', (req, res) => {
    res.send('Hello World!')
})