const socket = io();

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message');

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = messageInput.value;
    socket.emit('chat message', message);
    messageInput.value = '';
});

socket.on('chat message', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = msg;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const CHAT_HISTORY_FILE = path.join(__dirname, 'chat-history.json');

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected');

    // Load chat history and send to the new user
    fs.readFile(CHAT_HISTORY_FILE, (err, data) => {
        if (err) throw err;
        const chatHistory = JSON.parse(data || '[]');
        chatHistory.forEach(message => socket.emit('chat message', message));
    });

    // Handle incoming chat messages
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);

        // Save the message to the chat history
        fs.readFile(CHAT_HISTORY_FILE, (err, data) => {
            if (err) throw err;
            const chatHistory = JSON.parse(data || '[]');
            chatHistory.push(msg);
            fs.writeFile(CHAT_HISTORY_FILE, JSON.stringify(chatHistory), (err) => {
                if (err) throw err;
                io.emit('chat message', msg);
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
