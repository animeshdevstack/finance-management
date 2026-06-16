const Express = require("express");
const {
    createHistoryExpense,
    getAllHistoryExpense,
    getHistoryExpenseById,
    updateHistoryExpense,
    deleteHistoryExpense,
} = require("../controller/history-expense.controller");
const { verifyToken } = require("../helpers/middleware/auth.middleware");

const historyExpenseRouter = Express.Router();

historyExpenseRouter.use(verifyToken);
historyExpenseRouter.route("/").post(createHistoryExpense).get(getAllHistoryExpense);
historyExpenseRouter.route("/:id").get(getHistoryExpenseById).put(updateHistoryExpense).delete(deleteHistoryExpense);

module.exports = historyExpenseRouter;
