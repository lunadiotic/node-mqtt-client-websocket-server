const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mqtt = require("mqtt");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const clients = new Set();
const mqttClient = mqtt.connect("mqtt://broker.emqx.io");

wss.on('connection', (ws, req) => {
    console.log('Client connected');
    clients.add(ws);

    broadcast('Welcome to the server!');

    // Handle messages from clients
    ws.on('message', (message) => {
        const string = message.toString('utf-8');
        console.log(`Received: ${string}`);
        // Broadcast the message to all clients
        broadcast(string);
    });

    // Handle messages from mqtt after client connected
    mqttClient.on("message", (topic, message) => {
        // message is Buffer
        console.log(message.toString());
        console.log('topic', topic)
        // client.end();
        const string = message.toString('utf-8');
        console.log(`Received: ${string}`);
        // Broadcast the message to all clients
        broadcast(string);
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

mqttClient.on("connect", () => {
    console.log("Connected mqtt");
    mqttClient.subscribe("potensio-result", (err) => {
        if (!err) {
            mqttClient.publish("presence", "Hello mqtt");
        }
    });
})

// Handle messages from mqtt after start app
mqttClient.on("message", (topic, message) => {
    // message is Buffer
    console.log(message.toString());
    console.log('topic', topic)
    // client.end();
    const string = message.toString('utf-8');
    console.log(`Received: ${string}`);
    // Broadcast the message to all clients
    broadcast(string);
});

function broadcast(message) {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});