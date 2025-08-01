import http from 'http';
import fs from 'fs';
import path from 'path';
import Comment from './models/comment.js';
import User from './models/user.js';
import { __dirname } from './config.js';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // index.html
  if (req.url === '/' && req.method === 'GET') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('خطای داخلی سرور');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(data);
    });
    return;
  }

  // style.css
  if (req.url === '/style.css' && req.method === 'GET') {
    const filePath = path.join(__dirname, 'style.css');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('پیدا نشد');
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return res.end(data);
    });
    return;
  }

  // comments API
  if (req.url === '/comments') {
    if (req.method === 'GET') {
      const comments = Comment.all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(comments));
    }

    if (req.method === 'POST') {
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const { text, username, password } = JSON.parse(body);
          let user = User.get({ username, password });

          let message = '';

          if (!user) {
            message += "کاربر وجود ندارد. ثبت‌نام انجام شد. ";
            const newUser = new User({ username, password });
            user = newUser.save();

            if (!user) {
              message += "ثبت‌نام کاربر انجام نشد.";
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ message }));
            }
          }

          const newComment = new Comment({ text, userId: user.id }).save();
          message += "کامنت با موفقیت ثبت شد.";

          res.writeHead(201, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ message, comment: newComment }));
        } catch (err) {
          console.error('خطا در ثبت:', err.message);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'فرمت داده نادرست است' }));
        }
      });

      return;
    }

    // متد غیرمجاز
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'متد مجاز نیست' }));
  }

  // آدرس اشتباه
  res.writeHead(404, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ error: 'آدرس یافت نشد' }));
});

// شروع سرور
server.listen(3000, () => {
  console.log('سرور روی پورت 3000 اجرا شد');
});
