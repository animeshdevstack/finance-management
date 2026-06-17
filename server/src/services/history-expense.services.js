const historyEnpenseModel = require("../model/history-enpense.model");
const { getCategoryByIdServices } = require("./category.services");

const createHistoryExpenseServices = async (userId, categoryId, amount, description) => {
    if (!categoryId || amount == null || amount === "") {
        throw new Error("categoryId and amount are required");
    }

    const trimmedDescription = description != null ? String(description).trim() : "";
    if (!trimmedDescription) {
        throw new Error("description is required");
    }

    const numericAmount = Number(amount);
    await getCategoryByIdServices(categoryId, userId);

    const historyExpense = await historyEnpenseModel.create({
        UserId: userId,
        CategoryId: categoryId,
        Amount: numericAmount,
        Description: trimmedDescription,
    });

    return historyExpense;
};

const getAllHistoryExpenseServices = async (userId, categoryId) => {
    const filter = { UserId: userId };
    if (categoryId) {
        filter.CategoryId = categoryId;
    }
    return historyEnpenseModel.find(filter).sort({ createdAt: -1 }).populate("CategoryId", "Name");
};

const getHistoryExpenseByIdServices = async (id, userId) => {
    const historyExpense = await historyEnpenseModel.findById(id).populate("CategoryId", "Name");
    if (!historyExpense) {
        throw new Error("History expense not found");
    }
    if (historyExpense.UserId.toString() !== userId.toString()) {
        throw new Error("Unauthorized");
    }
    return historyExpense;
};

const updateHistoryExpenseServices = async (id, userId, { Amount, Description }) => {
    const historyExpense = await getHistoryExpenseByIdServices(id, userId);

    if (Amount != null) {
        historyExpense.Amount = Number(Amount);
    }

    if (Description != null) {
        const trimmedDescription = String(Description).trim();
        if (!trimmedDescription) {
            throw new Error("description is required");
        }
        historyExpense.Description = trimmedDescription;
    }

    await historyExpense.save();
    return historyExpense;
};

const deleteHistoryExpenseServices = async (id, userId) => {
    await getHistoryExpenseByIdServices(id, userId);
    return historyEnpenseModel.findByIdAndDelete(id);
};

module.exports = {
    createHistoryExpenseServices,
    getAllHistoryExpenseServices,
    getHistoryExpenseByIdServices,
    updateHistoryExpenseServices,
    deleteHistoryExpenseServices,
};
