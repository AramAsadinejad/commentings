// const fs = require('fs');
// const path = require('path');
import path from 'path';
import fs from 'fs';
import { __dirname } from '../config.js';

const COMMENTS_FILE = path.join(__dirname, 'database', 'comments.json');

class Comment {
    constructor({id,text,userId=null,productId=null,createdAt}){
        this.id = id;
        this.text = text;
        this.userId = userId;
        this.productId = productId;
        this.createdAt = createdAt || new Date().toISOString();
    }

    static all() {
        try {
            const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
            const json_data = JSON.parse(data);
            // console.log(json_data);
            return json_data.map(obj => new Comment(obj));
          } catch (err) {
            return [];
          }
    }

    static saveAll(comments) {
        const data = JSON.stringify(comments.map(c => ({ ...c })), null, 2);
        fs.writeFileSync(COMMENTS_FILE, data);
    }

    save() {
        const allComments = Comment.all();
        this.id = allComments.length ? allComments[allComments.length - 1].id + 1 : 1;
        allComments.push(this);
        Comment.saveAll(allComments);
        return this;
    }
}

export default Comment;