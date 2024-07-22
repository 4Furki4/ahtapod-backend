# Ahtapod Case Study Backend

This is the backend part of the Ahtapod Case Study. It is a REST API built with Express.js and Prisma. It is a simple blog API for CRUD operations on posts and users.
See the [`frontend repository here`](https://github.com/4furki4/ahtapod-case)

## Features

- Some endpoints are protected with JWT authentication using Clerk SDK for Node.js.
- Create, read, update, and delete posts.
- Input validation using zod.
- Pagination, and sorting for posts.

## Tech Stack

- Node.js
- Express.js
- Prisma
- MongoDB
- Clerk SDK for Node.js
- Zod

## Required Environment Variables

````bash
DATABASE_URI=
#You can find the Clerk keys in the Clerk dashboard
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
````

## API Endpoints

- `api/posts`
  - `GET` - Get all posts
  - `POST` - Create a new post
  - `api/posts/:id`
    - `PUT` - Update a post by id
    - `DELETE` - Delete a post by id
  - `/api/posts/count`
    - `GET` - Get the total number of posts

- `api/users/count`
  - `GET` - Get the total number of users


## Getting started

Install npm dependencies:

```
npm install
```

</details>

### 2. Start the REST API server

```
npm run dev
```

The server is now running on `http://localhost:3000`. You can now run the API requests, e.g. [`http://localhost:3000/feed`](http://localhost:3000/feed).
