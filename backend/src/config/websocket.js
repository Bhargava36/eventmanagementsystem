const { WebSocketServer, WebSocket } = require('ws');

let wss = null;

const initWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'JOIN_EVENT' && data.eventId) {
                    ws.eventId = String(data.eventId);
                }
            } catch (e) {
                // Ignore invalid json
            }
        });

        ws.on('error', (err) => {
            console.error('WebSocket client error:', err.message);
        });
    });

    const interval = setInterval(() => {
        if (!wss) return;
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    console.log('WebSocket Server initialized successfully');
    return wss;
};

const broadcastEvent = (eventId, payload) => {
    if (!wss) return;
    const msgString = JSON.stringify(payload);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            // Send if no client eventId set, or if client eventId matches
            if (!client.eventId || !eventId || String(client.eventId) === String(eventId)) {
                try {
                    client.send(msgString);
                } catch (e) {
                    console.error('Failed to send websocket message', e);
                }
            }
        }
    });
};

module.exports = { initWebSocket, broadcastEvent };
