const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

let users = [
    { username: 'user1', password: 'pass1', bio: 'Hello world!', profilePic: 'https://i.pravatar.cc/100', posts: [] },
    // Add more users as needed
];

let posts = [];

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Get user profile
app.get('/profile/:username', (req, res) => {
    const user = users.find(u => u.username === req.params.username);
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

// Update user profile
app.post('/profile/:username', (req, res) => {
    const user = users.find(u => u.username === req.params.username);
    if (user) {
        Object.assign(user, req.body);
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

// Get all posts
app.get('/posts', (req, res) => {
    res.json(posts);
});

// Add a post
app.post('/posts', (req, res) => {
    const newPost = { content: req.body.content, username: req.body.username, timestamp: Date.now() };
    posts.push(newPost);
    res.status(201).json(newPost);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
