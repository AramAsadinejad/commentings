export function isUsernameUnique(username, users){
    return !users.some(user => user.username === username);
}

export function isPasswordStrong(password) {
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password);
}