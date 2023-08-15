import { Router } from "express";
import { isAdmin, isAuth, requireSignIn, signAdminIn, signUserIn, registerUser } from "./../Controllers/auth.js";

const AuthRouter = Router();

AuthRouter.post('/signin', signAdminIn);
AuthRouter.post('/signin-user', signUserIn);
AuthRouter.post('/register-user', registerUser);
AuthRouter.get('/verifyToken', requireSignIn, isAdmin, (req, res) => {
    res.status(200).json(req.data);
});
AuthRouter.get('/verify-token', requireSignIn, isAuth, (req, res) => {
    res.status(200).json(req.data);
});

export default AuthRouter