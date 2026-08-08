const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();

const PORT = 3000;

const DB_PATH = path.join(
    __dirname,
    '../data/db.json'
);

app.use(cors());
app.use(express.json());


// GET /posts
app.get('/posts', async (req, res) => {
    try {
        const data = await fs.readFile(
            DB_PATH,
            'utf-8'
        );

        const db = JSON.parse(data);

        res.json(db.posts);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error reading database',
        });
    }
});

// GET /posts/:id
app.get('/posts/:id', async (req, res) => {
    try {
        const data = await fs.readFile(
            DB_PATH,
            'utf-8'
        );

        const db = JSON.parse(data);

        const id = Number(req.params.id);

        const post = db.posts.find(
            (post) => post.id === id
        );

        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
            });
        }

        res.json(post);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error reading database',
        });
    }
});


// POST /posts
app.post('/posts', async (req, res) => {
    try {
        const { title, body, userId } = req.body;

        if (!title || !body) {
            return res.status(400).json({
                message: 'Title and body are required',
            });
        }

        const data = await fs.readFile(
            DB_PATH,
            'utf-8'
        );

        const db = JSON.parse(data);

        const newPost = {
            id: db.posts.length > 0
                ? Math.max(
                    ...db.posts.map(post => post.id)
                ) + 1
                : 1,

            title,
            body,
            userId,
        };

        db.posts.push(newPost);

        await fs.writeFile(
            DB_PATH,
            JSON.stringify(db, null, 2)
        );

        res.status(201).json(newPost);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error creating post',
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});