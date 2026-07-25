const {
    parseStatementPdfServices,
    confirmStatementImportServices,
} = require("../services/statement-import.services");
const {
    assertSupportedBank,
    getBankConfig,
    normalizeBankId,
} = require("../constants/supported-banks");

const getUserId = (req) => req.user.data.userId;

function getClientErrorStatus(error) {
    const message = error.message || "";
    if (
        /unsupported bank|password is required|invalid pdf password/i.test(message)
    ) {
        return 400;
    }
    return 500;
}

const parseStatement = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF statement file is required",
            });
        }

        const bank = normalizeBankId(req.body.bank);
        assertSupportedBank(bank);

        const bankConfig = getBankConfig(bank);
        const password = String(req.body.password || "").trim();

        if (bankConfig.requiresPassword && !password) {
            return res.status(400).json({
                success: false,
                message: "PDF password is required for this bank statement.",
            });
        }

        const result = await parseStatementPdfServices(req.file.buffer, {
            bank,
            password: password || undefined,
        });

        return res.status(200).json({
            success: true,
            message: "Statement parsed successfully",
            statementPeriod: result.statementPeriod,
            transactions: result.transactions,
            warnings: result.warnings,
        });
    } catch (error) {
        const status = getClientErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 400 ? error.message : "Failed to parse statement",
            error: error.message,
        });
    }
};

const confirmStatementImport = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { transactions } = req.body;
        const stats = await confirmStatementImportServices(userId, transactions);

        return res.status(200).json({
            success: true,
            message: "Statement imported successfully",
            ...stats,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to import statement",
            error: error.message,
        });
    }
};

module.exports = {
    parseStatement,
    confirmStatementImport,
};
