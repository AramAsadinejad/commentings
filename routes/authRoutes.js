if (url === '/login' && method === 'POST') {
    return authController.login(req,res);
}else if (url === '/signup' && method === 'POST') {
    return authController.signup(req,res);
}