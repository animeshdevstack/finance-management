const {
    createHistoryExpenseServices,
    getAllHistoryExpenseServices,
    getHistoryExpenseByIdServices,
    updateHistoryExpenseServices,
    deleteHistoryExpenseServices,
} = require("../services/history-expense.services");

const getUserId = (req) => req.user.data.userId;

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
        const { categoryId } = req.query;
        const historyExpense = await getAllHistoryExpenseServices(userId, categoryId);
        return res.status(200).json({
            success: true,
            message: "History expense fetched successfully",
            data: historyExpense,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch history expense",
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
    getHistoryExpenseById,
    updateHistoryExpense,
    deleteHistoryExpense,
};
