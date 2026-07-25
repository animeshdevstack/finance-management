const sharedExpenseModel = require("../model/shared-expense.model");
const expenseSplitModel = require("../model/expense-split.model");
const groupMemberModel = require("../model/group-member.model");
const userModel = require("../model/user.model");
const {
    assertGroupMember,
    getMemberUserIds,
} = require("./group.services");
const {
    buildEqualSplits,
    computeNetBalances,
    simplifyDebts,
} = require("./balance.services");
const {
    assertValidObjectId,
    assertValidAmount,
    assertNonEmptyString,
} = require("../validators/money-split.validators");

async function createSharedExpenseServices(userId, data) {
    const groupId = data.groupId;
    await assertGroupMember(groupId, userId);

    const title = assertNonEmptyString(data.title, "Title");
    const description = String(data.description || "").trim();
    const totalAmount = assertValidAmount(data.totalAmount);
    const paidByUserId = data.paidByUserId || userId;

    assertValidObjectId(paidByUserId, "payer id");

    const memberUserIds = await getMemberUserIds(groupId);
    if (!memberUserIds.includes(String(paidByUserId))) {
        throw new Error("Payer must be a group member");
    }

    let participantUserIds = Array.isArray(data.participantUserIds)
        ? data.participantUserIds.map(String)
        : memberUserIds;

    participantUserIds = [...new Set(participantUserIds)];
    if (participantUserIds.length === 0) {
        throw new Error("At least one participant is required");
    }

    for (const participantId of participantUserIds) {
        if (!memberUserIds.includes(participantId)) {
            throw new Error("All participants must be group members");
        }
    }

    const expenseDate = data.expenseDate ? new Date(data.expenseDate) : new Date();
    if (Number.isNaN(expenseDate.getTime())) {
        throw new Error("Invalid expense date");
    }

    const expense = await sharedExpenseModel.create({
        groupId,
        title,
        description,
        totalAmount,
        paidByUserId,
        expenseDate,
        createdBy: userId,
    });

    const splitRows = buildEqualSplits(totalAmount, participantUserIds).map((row) => ({
        expenseId: expense._id,
        userId: row.userId,
        owedAmount: row.owedAmount,
    }));

    await expenseSplitModel.insertMany(splitRows);

    return getExpenseWithSplits(expense._id, userId);
}

async function getExpenseWithSplits(expenseId, userId) {
    const expense = await sharedExpenseModel.findById(expenseId);
    if (!expense) {
        throw new Error("Expense not found");
    }

    await assertGroupMember(expense.groupId, userId);

    const splits = await expenseSplitModel.find({ expenseId });
    const payer = await userModel.findById(expense.paidByUserId).select("Name");

    return {
        _id: expense._id,
        groupId: expense.groupId,
        title: expense.title,
        description: expense.description,
        totalAmount: expense.totalAmount,
        paidByUserId: expense.paidByUserId,
        paidByName: payer?.Name || "User",
        expenseDate: expense.expenseDate,
        createdBy: expense.createdBy,
        splits: splits.map((split) => ({
            userId: split.userId,
            owedAmount: split.owedAmount,
        })),
        createdAt: expense.createdAt,
    };
}

async function listGroupExpensesServices(groupId, userId) {
    await assertGroupMember(groupId, userId);

    const expenses = await sharedExpenseModel
        .find({ groupId })
        .sort({ expenseDate: -1, createdAt: -1 });

    return Promise.all(
        expenses.map((expense) => getExpenseWithSplits(expense._id, userId))
    );
}

async function deleteSharedExpenseServices(groupId, expenseId, userId) {
    await assertGroupMember(groupId, userId);

    const expense = await sharedExpenseModel.findOne({ _id: expenseId, groupId });
    if (!expense) {
        throw new Error("Expense not found");
    }

    const membership = await groupMemberModel.findOne({ groupId, userId });
    const isOwner = membership?.role === "owner";
    const isCreator = String(expense.createdBy) === String(userId);

    if (!isOwner && !isCreator) {
        throw new Error("Only the group owner or expense creator can delete this expense");
    }

    await expenseSplitModel.deleteMany({ expenseId });
    await sharedExpenseModel.deleteOne({ _id: expenseId });

    return { deleted: true };
}

async function getGroupBalancesServices(groupId, userId) {
    await assertGroupMember(groupId, userId);

    const memberUserIds = await getMemberUserIds(groupId);
    const expenses = await sharedExpenseModel.find({ groupId });
    const expenseIds = expenses.map((expense) => expense._id);
    const splits = await expenseSplitModel.find({ expenseId: { $in: expenseIds } });

    const users = await userModel.find({ _id: { $in: memberUserIds } }).select("Name");
    const userNames = new Map(users.map((user) => [String(user._id), user.Name]));

    const netBalances = computeNetBalances(expenses, splits, memberUserIds);
    const memberBalances = memberUserIds.map((memberId) => ({
        userId: memberId,
        Name: userNames.get(memberId) || "User",
        netBalance: Math.round((netBalances.get(memberId) || 0) * 100) / 100,
    }));

    const settlements = simplifyDebts(netBalances, userNames);

    return {
        memberBalances,
        settlements,
    };
}

module.exports = {
    createSharedExpenseServices,
    listGroupExpensesServices,
    deleteSharedExpenseServices,
    getGroupBalancesServices,
};
