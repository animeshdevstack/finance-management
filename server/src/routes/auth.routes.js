const Express = require("express");
const { SignUp, SignIn, OTPVerification } = require("../controller/user.controller");

const userRouter = Express.Router();

userRouter.post('/signup', SignUp)
userRouter.post('/signin', SignIn)
userRouter.post('/otp', OTPVerification)

module.exports = userRouter;
