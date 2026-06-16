const jwt = require("jsonwebtoken");
const configuration = require("../config/configuration");

const generateToken = (data, time = "1h") => {
    return jwt.sign({ data }, configuration.JWT_SECRET, { expiresIn: time });
}

const generateRefreshToken = (data, time = "30d") => {
    return jwt.sign({ data }, configuration.REFRESH_SECRET, { expiresIn: time });
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, configuration.JWT_SECRET);
    } catch {
        throw new Error("Invalid token");
    }
}

const verifyRefreshToken = (refreshToken) => {
    try {
        return jwt.verify(refreshToken, configuration.REFRESH_SECRET);
    } catch {
        throw new Error("Invalid refresh token");
    }
}

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
}
