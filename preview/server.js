const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Erro ao carregar a página');
        return;
      }
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    });
  } else {
    res.writeHead(404);
    res.end('Página não encontrada');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Preview do Sheriff Rex Bot rodando em http://0.0.0.0:${PORT}`);
  console.log(`🤠 Acesse pelo navegador para ver a preview do bot!`);
});
