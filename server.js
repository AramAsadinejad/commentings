import http from 'http';
import fs from 'fs';
import path from 'path';
import Comment from './models/comment.js';
import User from './models/user.js';
import { __dirname } from './config.js';
import { sessions } from './config.js';
import { generateSessionId } from './utils.js';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const cookies = parseCookies(req.headers.cookie);
  const sessionUserId = sessions.get(cookies.sessionId);

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
      if (!sessionUserId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'ابتدا وارد شوید' }));
      }
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
  } else if( req.url ==='/auth/login' && req.method === 'POST') {

    let body ='';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () =>{
      try {
        const { username, password } = JSON.parse(body);
        const user = User.get({ username, password });

        if (!user) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ message: 'نام کاربری یا رمز عبور نادرست است' }));
        }

        const sessionId = generateSessionId();
        sessions.set(sessionId, user.id);
        res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': `sessionId=${sessionId}; HttpOnly`,
              });
        return res.end(JSON.stringify({ message: 'ورود موفقیت‌آمیز بود', user }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'فرمت داده نادرست است' }));
      }
    });

    return;

     
  } else if (req.url === '/auth/signup' && req.method === 'POST') {

    let body = '';
    req.on('date',chunk =>{
      body += chunk;
    });
    req.on('end',() => {
      const {username, password} = body;
      if (User.get({username})) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'نام کاربری قبلاً ثبت شده' }));
      }

      const user = new User({username, password}).save()

      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'ثبت‌نام با موفقیت انجام شد', user }));

    })
    
  }

  // آدرس اشتباه
  res.writeHead(404, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ error: 'آدرس یافت نشد' }));
});

// شروع سرور
server.listen(3000, () => {
  console.log('سرور روی پورت 3000 اجرا شد');
});
