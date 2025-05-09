const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000 });

wss.on('connection', ws => {
  ws.on('message', message => {
    if (message === 'vote_cast') {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('update_votes');
        }
      });
    }
  });
});

console.log('WebSocket server running on ws://localhost:4000'); 