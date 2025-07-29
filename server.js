// const http = require('http');
// const fs = require('fs');
// const path = require('path');
// const Comment = require('./models/comment');



import http from 'http';
import fs from'fs';
import path from 'path';
import Comment from './models/comment.js';
import { __dirname,__filename } from './config.js';
import User from './models/user.js';

const COMMENTS_FILE = path.join(__dirname, '..', 'database', 'comments.json');
// function readComments() {
//   try {
//     const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
//     return JSON.parse(data);
//   } catch (err) {
//     return [];
//   }
// }

// function writeComments(comments) {
//   fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
// }

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
      const comments = Comment.all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(comments));
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        console.log('chunk:', chunk.toString());
        body += chunk.toString();
      }); // in bakhsh marboot be gereftane vroodi hastesh
      req.on('end', () => {
        try {
          console.log('body: ',body);
          const { text,username } = JSON.parse(body);
          const user = User.get({"username":username});
          console.log(user);
          const newC = new Comment({text:text, userId:user.id}); // ye obj az text to misaze
          const newComment = newC.save();  // oon obj ro to db save mikone
          console.log('newComment:', newComment);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newComment));  //inam be onvane response bar migardoone
        } catch (err) {
          console.error('Error in save:', err.message);
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
