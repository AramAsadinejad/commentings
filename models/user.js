import { __dirname } from "../config.js";
import fs from 'fs';
import path from "path";
import { isUsernameUnique,isPasswordStrong } from "../utils.js";

const USERS_FILE = path.join(__dirname, 'database', 'users.json');

class User {
    constructor({id=null,username,password}){
        this.id = id;
        this.username = username;
        this.password = password;
    }

    static all(){
        try {
            console.log(USERS_FILE);
            const data = fs.readFileSync(USERS_FILE);
            const json_data = JSON.parse(data);
            return json_data.map(obj => new User(obj))

        } catch (err) {
            return []
        }
    }

    static saveAll(users) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }

    validate() {
        const users = User.all()
        return isUsernameUnique(this.username,users) && isPasswordStrong(this.password)
    }

    save() {
        if (this.validate) {
            const allUsers = User.all()
            this.id = allUsers.length ? allUsers[allUsers.length - 1].id + 1 : 1;
            allUsers.push(this);
            User.saveAll(allUsers);
            return this;

        } else {
            return "not a valid user";
        }
    }

    static get(criteria) {
        const users = User.all();
        console.log(users);
        for (let user of users){
            let flag = true;
            for (let key in criteria){
                console.log(1);
                if (user[key]!==criteria[key]) {
                    flag = false;
                    break;
                }
            }
            console.log(flag);
            if (flag) {
                return user;
            }
        }

        return undefined;

        // return users.find(user =>
        //     Object.entries(criteria).every(([key, value]) => user[key] === value)
        // ) || null;
    }
}

export default User;