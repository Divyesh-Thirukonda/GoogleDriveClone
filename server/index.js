// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');
const bcrypt = require('bcrypt');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Basic User model
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String, // Note: Implement proper password hashing for production
}));

// JWT authentication middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Basic Document model
const Document = mongoose.model('Document', new mongoose.Schema({
    title: String,
    content: String,
    ownerId: String
}));


// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.json({ message: 'User registered successfully' });
});

// Update login route to verify hashed password
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.sendStatus(401);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.sendStatus(401);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
});



app.get('/documents', authenticateToken, async (req, res) => {
    const documents = await Document.find({ ownerId: req.user.id });
    res.json(documents);
});

app.post('/documents', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const document = new Document({ title, content, ownerId: req.user.id });
    await document.save();
    res.json(document);
});

// Real-time editing with Socket.io
io.on('connection', (socket) => {
    console.log("User connected");

    socket.on('join-document', (documentId) => {
        socket.join(documentId);
    });

    socket.on('edit-document', (documentId, content) => {
        io.to(documentId).emit('document-updated', content);
    });

    socket.on('disconnect', () => {
        console.log("User disconnected");
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

