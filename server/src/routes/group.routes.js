const Express = require("express");
const {
    createGroup,
    listGroups,
    getGroupById,
    getGroupBalances,
} = require("../controller/group.controller");
const {
    createSharedExpense,
    listGroupExpenses,
    deleteSharedExpense,
} = require("../controller/shared-expense.controller");
const { verifyToken } = require("../helpers/middleware/auth.middleware");

const groupRouter = Express.Router();

groupRouter.use(verifyToken);
groupRouter.route("/").post(createGroup).get(listGroups);
groupRouter.route("/:id").get(getGroupById);
groupRouter.route("/:id/balances").get(getGroupBalances);
groupRouter.route("/:groupId/expenses").post(createSharedExpense).get(listGroupExpenses);
groupRouter.route("/:groupId/expenses/:expenseId").delete(deleteSharedExpense);

module.exports = groupRouter;
