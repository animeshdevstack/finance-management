const { signUpUserServices, signInUserServices, OTPVerificationServices } = require("../services/user.services");
const logger = require("../helpers/logger");

const SignUp = async(req, res) => {
    try {
        logger.log(":: inside the signup controller ::")
        const userDetails = await signUpUserServices(req.body)
        logger.log(":: userDetails ::", userDetails)
        return res.status(200).json({
            success: true,
            message: "Successfully created the user",
            userDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create the user",
            Error: error.message
        })
    }
}

const SignIn = async(req, res) => {
    logger.log(":: inside the signin controller ::")
    logger.log(":: req.body ::", req.body)
 try {
    logger.log(":: inside the signin controller ::")
        const userDetails = await signInUserServices(req.body)
        logger.log(":: userDetails ::", userDetails)
        return res.status(200).json({
            success: true,
            message: "Successfully signed in the user",
            userDetails
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create the user",
            Error: error.message
        })
    }
}

const OTPVerification = async(req, res) => {
    try {
        const { userId, otp } = req.body;
        const { token, refreshToken, userDetails } = await OTPVerificationServices({userId, otp});
        return res.status(200).json({
            success: true,
            message: "Successfully verified the OTP",
            userDetails,
            token,
            refreshToken
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to verify the OTP",
            Error: error.message
        })
    }
}

module.exports = {
    SignIn,
    SignUp,
    OTPVerification
}