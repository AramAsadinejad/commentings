const http = require('http');
const fs = require('fs');
const path = require('path');

const COMMENTS_FILE = path.join(__dirname, 'database', 'comments.json');

function readComments() {
  try {
    const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeComments(comments) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Serve index.html at root (/)
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
    return;
  }

  // Serve style.css
  if (req.url === '/style.css' && req.method === 'GET') {
    fs.readFile(path.join(__dirname, 'style.css'), (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      }
    });
    return;
  }


  if (req.url === '/comments') {
    if (req.method === 'GET') {
      const comments = readComments();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(comments));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const comment = JSON.parse(body);
          const comments = readComments();
          const newComment = {
            id: comments.length ? comments[comments.length - 1].id + 1 : 1,
            text: comment.text,
            createdAt: new Date().toISOString()
          };
          comments.push(newComment);
          writeComments(comments);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newComment));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'فرمت داده نادرست است' }));
        }
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'متد مجاز نیست' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'آدرس یافت نشد' }));
  }
});

server.listen(3000, () => {
  console.log('سرور روی پورت 3000 اجرا شد');
});
