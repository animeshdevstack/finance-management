const {
    parseStatementPdfServices,
    confirmStatementImportServices,
} = require("../services/statement-import.services");

const getUserId = (req) => req.user.data.userId;

const parseStatement = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF statement file is required",
            });
        }

        const result = await parseStatementPdfServices(req.file.buffer);

        return res.status(200).json({
            success: true,
            message: "Statement parsed successfully",
            statementPeriod: result.statementPeriod,
            transactions: result.transactions,
            warnings: result.warnings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to parse statement",
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
