function normalizePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (digits.length === 10) {
        return digits;
    }

    if (digits.length === 12 && digits.startsWith("91")) {
        return digits.slice(2);
    }

    if (digits.length === 11 && digits.startsWith("0")) {
        return digits.slice(1);
    }

    throw new Error("Enter a valid 10-digit phone number");
}

function maskPhone(phone) {
    const normalized = String(phone || "");
    if (normalized.length < 4) return normalized;
    return `${normalized.slice(0, 2)}****${normalized.slice(-4)}`;
}

module.exports = {
    normalizePhone,
    maskPhone,
};
