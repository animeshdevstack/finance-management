const INACTIVE_AFTER_MS = 90 * 24 * 60 * 60 * 1000;

function resolveAccountState(user) {
    if (!user) return "pending";

    if (user.accountState === "pending") {
        return "pending";
    }

    if (user.lastLoginAt) {
        const inactiveCutoff = Date.now() - INACTIVE_AFTER_MS;
        if (new Date(user.lastLoginAt).getTime() < inactiveCutoff) {
            return "inactive";
        }
    }

    return user.accountState === "inactive" ? "inactive" : "active";
}

function isInactive(user) {
    return resolveAccountState(user) === "inactive";
}

module.exports = {
    INACTIVE_AFTER_MS,
    resolveAccountState,
    isInactive,
};
