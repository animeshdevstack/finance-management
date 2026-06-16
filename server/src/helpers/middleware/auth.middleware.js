const { verifyToken: jwtVerify, verifyRefreshToken: jwtVerifyRefresh } = require("../jwt");

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwtVerify(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

const verifyRefreshToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const refreshToken = authHeader.split(" ")[1];
        const decoded = jwtVerifyRefresh(refreshToken);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

module.exports = {
    verifyToken,
    verifyRefreshToken
}
