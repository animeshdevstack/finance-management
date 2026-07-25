const mongoose = require("mongoose");
const { normalizePhone } = require("../helpers/phone.utils");
const { GROUP_TYPES } = require("../model/group.model");

function assertValidObjectId(value, label = "id") {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${label}`);
    }
}

function assertValidAmount(amount) {
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error("Amount must be greater than zero");
    }
    return parsed;
}

function assertValidPhone(phone) {
    return normalizePhone(phone);
}

function assertGroupType(type) {
    if (!GROUP_TYPES.includes(type)) {
        throw new Error("Group type must be direct or group");
    }
    return type;
}

function assertDirectMemberCount(memberUserIds) {
    if (memberUserIds.length !== 2) {
        throw new Error("Direct split requires exactly 2 members");
    }
}

function assertGroupMemberCount(memberUserIds) {
    if (memberUserIds.length < 2) {
        throw new Error("Group requires at least 2 members");
    }
}

function assertUniqueMemberIds(memberUserIds) {
    const unique = new Set(memberUserIds.map(String));
    if (unique.size !== memberUserIds.length) {
        throw new Error("Duplicate members are not allowed");
    }
}

function assertNonEmptyString(value, label) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
        throw new Error(`${label} is required`);
    }
    return trimmed;
}

module.exports = {
    assertValidObjectId,
    assertValidAmount,
    assertValidPhone,
    assertGroupType,
    assertDirectMemberCount,
    assertGroupMemberCount,
    assertUniqueMemberIds,
    assertNonEmptyString,
};
