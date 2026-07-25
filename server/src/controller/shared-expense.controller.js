const {
    createSharedExpenseServices,
    listGroupExpensesServices,
    deleteSharedExpenseServices,
} = require("../services/shared-expense.services");

const getUserId = (req) => req.user.data.userId;

function getErrorStatus(error) {
    const message = error.message || "";
    if (/not a member|not found|required|invalid|only the group owner|must be/i.test(message)) {
        if (message.includes("not a member")) return 403;
        if (message.includes("not found")) return 404;
        return 400;
    }
    return 500;
}

const createSharedExpense = async (req, res) => {
    try {
        const userId = getUserId(req);
        const expense = await createSharedExpenseServices(userId, {
            ...req.body,
            groupId: req.params.groupId,
        });
        return res.status(200).json({
            success: true,
            message: "Expense added successfully",
            expense,
        });
    } catch (error) {
        const status = getErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Failed to add expense" : error.message,
            error: error.message,
        });
    }
};

const listGroupExpenses = async (req, res) => {
    try {
        const userId = getUserId(req);
        const expenses = await listGroupExpensesServices(req.params.groupId, userId);
        return res.status(200).json({
            success: true,
            message: "Expenses fetched successfully",
            expenses,
        });
    } catch (error) {
        const status = getErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Failed to fetch expenses" : error.message,
            error: error.message,
        });
    }
};

const deleteSharedExpense = async (req, res) => {
    try {
        const userId = getUserId(req);
        const result = await deleteSharedExpenseServices(
            req.params.groupId,
            req.params.expenseId,
            userId
        );
        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
            ...result,
        });
    } catch (error) {
        const status = getErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Failed to delete expense" : error.message,
            error: error.message,
        });
    }
};

module.exports = {
    createSharedExpense,
    listGroupExpenses,
    deleteSharedExpense,
};
