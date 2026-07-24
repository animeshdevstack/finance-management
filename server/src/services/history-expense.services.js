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

function buildUserFilter(userId, categoryId) {
    const filter = { UserId: userId };
    if (categoryId) {
        filter.CategoryId = categoryId;
    }
    return filter;
}

function buildMonthDateFilter(year, month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    return { $gte: start, $lt: end };
}

const getAllHistoryExpenseServices = async (userId, { categoryId, year, month, page = 1, limit = 20 }) => {
    const filter = buildUserFilter(userId, categoryId);
    filter.createdAt = buildMonthDateFilter(year, month);

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, data] = await Promise.all([
        historyEnpenseModel.countDocuments(filter),
        historyEnpenseModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("CategoryId", "Name"),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum);

    return {
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
        },
    };
};

const getHistoryExpenseAnalyticsServices = async (userId, { categoryId, start, end }) => {
    const filter = buildUserFilter(userId, categoryId);
    filter.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end),
    };

    return historyEnpenseModel
        .find(filter)
        .sort({ createdAt: -1 })
        .populate("CategoryId", "Name");
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
    getHistoryExpenseAnalyticsServices,
    getHistoryExpenseByIdServices,
    updateHistoryExpenseServices,
    deleteHistoryExpenseServices,
};
