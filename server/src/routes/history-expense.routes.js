const Express = require("express");
const {
    createHistoryExpense,
    getAllHistoryExpense,
    getHistoryExpenseAnalytics,
    getHistoryExpenseById,
    updateHistoryExpense,
    deleteHistoryExpense,
} = require("../controller/history-expense.controller");
const { verifyToken } = require("../helpers/middleware/auth.middleware");

const historyExpenseRouter = Express.Router();

historyExpenseRouter.use(verifyToken);
historyExpenseRouter.route("/").post(createHistoryExpense).get(getAllHistoryExpense);
historyExpenseRouter.get("/analytics", getHistoryExpenseAnalytics);
historyExpenseRouter.route("/:id").get(getHistoryExpenseById).put(updateHistoryExpense).delete(deleteHistoryExpense);

module.exports = historyExpenseRouter;
