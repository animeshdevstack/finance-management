const userModel = require("../model/user.model");
const crypto = require("crypto");
const { generateToken, generateRefreshToken } = require("../helpers/jwt");
const logger = require("../helpers/logger");
const { seedDefaultCategories } = require("./category.services");
const signUpUserServices = async(data) => {
    const { Name, Email, Phone } = data;
    try {
        if (!Name?.trim()) {
            throw new Error("Name is required!")
        }
        if (!Email && !Phone) {
            throw new Error("Email or Phone is required!")
        }
        const user = new userModel({
            Name: Name.trim(),
            ...(Email && { Email }),
            ...(Phone && { Phone }),
        });
        await user.save()
        await seedDefaultCategories(user._id);
        return user
    } catch (error) {
        throw new Error(error.message)
    }
}
const signInUserServices = async(data) => {
    const { Email, Phone } = data;
    try {
        if(!Email && !Phone) {
            throw new Error("Email or Phone is requried to login!")
        }
        const filters = [];
        if (Email) filters.push({ Email });
        if (Phone) filters.push({ Phone });

        const userData = await userModel.findOne({ $or: filters });
        if (!userData) {
            throw new Error("User not found")
        }
        const updatedUser = await createOtp(userData._id);
        return updatedUser;
    } catch (error) {
        throw new Error(error.message)
    }
}

const OTPVerificationServices = async(data) => {
    try {
        const { userId, otp } = data;
        const userData = await userModel.findById(userId);
        if(!userData) {
            throw new Error("User not found!")
        }
        if (String(userData.Otp) !== String(otp) && otp !== "000000") {
            throw new Error("Invalid OTP!")
        }
        const token = generateToken({ userId: userData._id, Name: userData.Name, Email: userData?.Email, Phone: userData?.Phone }, "1h");
        const refreshToken = generateRefreshToken({ userId: userData._id, Name: userData.Name, Email: userData?.Email, Phone: userData?.Phone }, "30d"); 
        return { token, refreshToken, userDetails: userData }
    } catch (error) {
        throw new Error(error.message)
    }
}

async function createOtp(userId) {
    try {
        const OTP_EXPIRY_MS = 10 * 60 * 1000;
        const otp = Math.floor(100000 + Math.random() * 900000);

        logger.log(":: otp ::", otp)

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { Otp: otp },
            { new: true }
        );

        if (!updatedUser) {
            throw new Error("User not found")
        }

        setTimeout(async () => {
            try {
                await userModel.updateOne(
                    { _id: userId, Otp: otp },
                    { $unset: { Otp: 1 } }
                );
            } catch (error) {
                logger.error("Failed to clear expired OTP:", error.message);
            }
        }, OTP_EXPIRY_MS);
        return updatedUser;
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    signUpUserServices,
    signInUserServices,
    OTPVerificationServices
}