const userModel = require("../model/user.model");
const { normalizePhone } = require("../helpers/phone.utils");

async function resolveUserByPhone(phone, { createdByUserId, displayName } = {}) {
    const normalizedPhone = normalizePhone(phone);
    let user = await userModel.findOne({ Phone: normalizedPhone });

    if (user) {
        return user;
    }

    user = new userModel({
        Name: String(displayName || "User").trim() || "User",
        Phone: normalizedPhone,
        accountState: "pending",
        createdByUserId: createdByUserId || null,
        isProfileComplete: false,
    });

    await user.save();
    return user;
}

module.exports = {
    resolveUserByPhone,
};
