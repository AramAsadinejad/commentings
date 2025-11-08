import { handleLogin, handleSignup } from "../services/userService";

export async function login(req, res) {
    const result = await handleLogin(req);
    if (result.success) {
        res.writeHead(200, {
                'Content-Type': 'application/json',
                'Set-Cookie': `sessionId=${result.sid}; HttpOnly`,
              });
        return res.end(JSON.stringify({ message: 'ورود موفقیت‌آمیز بود', user }));
    } else {
        res.writeHead(400, {
            'Content-Type': 'application/json'
        });
        return res.end(JSON.stringify({error: "wrong data format"}));
    }
}

export async function signup(req, res) {
    const result = await handleSignup(req);
    
}