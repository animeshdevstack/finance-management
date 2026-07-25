const SUPPORTED_BANKS = [
    { id: "icici", label: "ICICI Bank", requiresPassword: false },
    { id: "hdfc", label: "HDFC Bank", requiresPassword: true },
];

const BANK_IDS = new Set(SUPPORTED_BANKS.map((bank) => bank.id));

function getBankConfig(bankId) {
    return SUPPORTED_BANKS.find((bank) => bank.id === bankId) || null;
}

function normalizeBankId(bankId) {
    return String(bankId || "icici").trim().toLowerCase();
}

function assertSupportedBank(bankId) {
    const normalized = normalizeBankId(bankId);
    if (!BANK_IDS.has(normalized)) {
        throw new Error("Unsupported bank selected");
    }
    return normalized;
}

module.exports = {
    SUPPORTED_BANKS,
    getBankConfig,
    normalizeBankId,
    assertSupportedBank,
};
