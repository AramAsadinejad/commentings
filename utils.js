import { sessions } from "./config.js";

export function isUsernameUnique(username, users){
    return !users.some(user => user.username === username);
}

export function isPasswordStrong(password) {
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password);
}

export function generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = decodeURIComponent(rest.join('='));
  });
  return cookies;
};