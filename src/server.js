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
        const {
            page = 1,
            pageSize = 10,
            columnOrder = 'asc'
        } = req.query;

        const currentPage = Number(page);
        const size = Number(pageSize);

        if (currentPage < 1 || size < 1) {
            return res.status(400).json({
                message: 'page and pageSize must be greater than 0'
            });
        }

        const data = await fs.readFile(
            DB_PATH,
            'utf-8'
        );

        const db = JSON.parse(data);

        let posts = [...db.posts];

        // Ordenar por ID
        posts.sort((a, b) => {
            if (columnOrder === 'desc') {
                return b.id - a.id;
            }

            return a.id - b.id;
        });

        // Información de paginación
        const totalElements = posts.length;
        const totalPages = Math.ceil(totalElements / size);

        // Calcular posición inicial
        const startIndex = (currentPage - 1) * size;

        // Obtener solamente los elementos de la página
        const content = posts.slice(
            startIndex,
            startIndex + size
        );

        res.json({
            content,
            pageable: {
                pageNumber: currentPage,
                pageSize: size
            },
            last: currentPage >= totalPages,
            totalPages,
            totalElements,
            size,
            number: currentPage,
            sort: {
                sorted: columnOrder === 'asc'
            },
            first: currentPage === 1,
            numberOfElements: content.length,
            empty: content.length === 0
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error reading database'
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