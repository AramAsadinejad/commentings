import { sessions } from "../config.js";
import User from "../models/user.js";
import { generateSessionId, parseRequestBody } from "../utils.js";

export async function handleLogin(req) {
    const {username, password} = await parseRequestBody(req);
    const user = User.get({username, password});
    if (!user) return {success: false};
    const sessionId = generateSessionId();
    sessions.set(sessionId, { userId: user.id});

    return { success: true, sid: sessionId};
}

export async function handleSignup(req) {
    const {username, password} = await parseRequestBody(req);
    if (User.get({username})) return {success: false};
    const user = new User({username, password}).save();
    return { success: true };
}