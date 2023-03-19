// server.js
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Serve the index.html file with the embedded client-side JavaScript code
    fs.readFile('index.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading index.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        // Inject the client-side JavaScript code into the HTML file
        const script = `<script src="/socket.io/socket.io.js"></script>
                        <script>
                          const socket = io();
                          const messageForm = document.getElementById('message-form');
                          const messageInput = messageForm.querySelector('input[name="message"]');
                          const messagesDiv = document.getElementById('messages');

                          socket.on('message', message => {
                            const messageDiv = document.createElement('div');
                            messageDiv.innerText = message;
                            messagesDiv.appendChild(messageDiv);
                          });

                          messageForm.addEventListener('submit', e => {
                            e.preventDefault();
                            const message = messageInput.value;
                            socket.emit('message', message);
                            messageInput.value = '';
                          });
                        </script>`;
        const html = data.toString().replace('</body>', `${script}</body>`);
        res.end(html);
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const io = socketio(server);

io.on('connection', socket => {
  console.log(`User ${socket.id} connected`);

  socket.on('message', message => {
    console.log(`User ${socket.id} sent message: ${message}`);
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
