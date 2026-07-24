const {
    createHistoryExpenseServices,
    getAllHistoryExpenseServices,
    getHistoryExpenseAnalyticsServices,
    getHistoryExpenseByIdServices,
    updateHistoryExpenseServices,
    deleteHistoryExpenseServices,
} = require("../services/history-expense.services");

const getUserId = (req) => req.user.data.userId;

function isValidMonth(month) {
    return /^(0[1-9]|1[0-2])$/.test(String(month));
}

function isValidYear(year) {
    const yearNum = Number(year);
    return Number.isInteger(yearNum) && yearNum >= 1970 && yearNum <= 2100;
}

function isValidDate(value) {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
}

const createHistoryExpense = async (req, res) => {
    try {
        const { categoryId, amount, description } = req.body;
        const userId = getUserId(req);
        const historyExpense = await createHistoryExpenseServices(userId, categoryId, amount, description);
        return res.status(200).json({
            success: true,
            message: "History expense created successfully",
            data: historyExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create history expense",
            error: error.message,
        });
    }
};

const getAllHistoryExpense = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { categoryId, year, month, page, limit } = req.query;

        if (!year || !month) {
            return res.status(400).json({
                success: false,
                message: "year and month are required",
            });
        }

        if (!isValidYear(year)) {
            return res.status(400).json({
                success: false,
                message: "Invalid year",
            });
        }

        if (!isValidMonth(month)) {
            return res.status(400).json({
                success: false,
                message: "Invalid month",
            });
        }

        const result = await getAllHistoryExpenseServices(userId, {
            categoryId,
            year,
            month,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            message: "History expense fetched successfully",
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch history expense",
            error: error.message,
        });
    }
};

const getHistoryExpenseAnalytics = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { categoryId, start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                success: false,
                message: "start and end are required",
            });
        }

        if (!isValidDate(start) || !isValidDate(end)) {
            return res.status(400).json({
                success: false,
                message: "Invalid start or end date",
            });
        }

        if (new Date(start) > new Date(end)) {
            return res.status(400).json({
                success: false,
                message: "start must be before or equal to end",
            });
        }

        const data = await getHistoryExpenseAnalyticsServices(userId, {
            categoryId,
            start,
            end,
        });

        return res.status(200).json({
            success: true,
            message: "History expense analytics fetched successfully",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch history expense analytics",
            error: error.message,
        });
    }
};

const getHistoryExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const historyExpense = await getHistoryExpenseByIdServices(id, userId);
        return res.status(200).json({
            success: true,
            message: "History expense fetched successfully",
            data: historyExpense,
        });
    } catch (error) {
        const status = error.message === "Unauthorized" ? 403 : error.message === "History expense not found" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to fetch history expense",
            error: error.message,
        });
    }
};

const updateHistoryExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { Amount, Description } = req.body;
        const userId = getUserId(req);
        const updatedHistoryExpense = await updateHistoryExpenseServices(id, userId, { Amount, Description });
        return res.status(200).json({
            success: true,
            message: "History expense updated successfully",
            data: updatedHistoryExpense,
        });
    } catch (error) {
        const status = error.message === "Unauthorized" ? 403 : error.message === "History expense not found" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to update history expense",
            error: error.message,
        });
    }
};

const deleteHistoryExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const historyExpense = await deleteHistoryExpenseServices(id, userId);
        return res.status(200).json({
            success: true,
            message: "History expense deleted successfully",
            data: historyExpense,
        });
    } catch (error) {
        const status = error.message === "Unauthorized" ? 403 : error.message === "History expense not found" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to delete history expense",
            error: error.message,
        });
    }
};

module.exports = {
    createHistoryExpense,
    getAllHistoryExpense,
    getHistoryExpenseAnalytics,
    getHistoryExpenseById,
    updateHistoryExpense,
    deleteHistoryExpense,
};
