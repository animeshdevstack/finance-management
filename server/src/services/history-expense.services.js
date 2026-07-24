const mongoose = require("mongoose");
const historyEnpenseModel = require("../model/history-enpense.model");
const { getCategoryByIdServices } = require("./category.services");
const { buildEffectiveDateRangeMatch } = require("../helpers/expense-date.helper");

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
        transactionDate: new Date(),
    });

    return historyExpense;
};

function buildUserFilter(userId, categoryId) {
    const filter = { UserId: new mongoose.Types.ObjectId(userId) };
    if (categoryId) {
        filter.CategoryId = new mongoose.Types.ObjectId(categoryId);
    }
    return filter;
}

function buildMonthDateFilter(year, month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    return { start, end };
}

function categoryLookupStages() {
    return [
        {
            $lookup: {
                from: "categories",
                localField: "CategoryId",
                foreignField: "_id",
                as: "categoryDoc",
            },
        },
        {
            $unwind: {
                path: "$categoryDoc",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                CategoryId: {
                    _id: "$categoryDoc._id",
                    Name: "$categoryDoc.Name",
                },
            },
        },
        {
            $project: {
                categoryDoc: 0,
                effectiveDate: 0,
            },
        },
    ];
}

const getAllHistoryExpenseServices = async (userId, { categoryId, year, month, page = 1, limit = 20 }) => {
    const { start, end } = buildMonthDateFilter(year, month);
    const baseMatch = {
        ...buildUserFilter(userId, categoryId),
        ...buildEffectiveDateRangeMatch(start, end),
    };

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
        { $match: baseMatch },
        {
            $addFields: {
                effectiveDate: { $ifNull: ["$transactionDate", "$createdAt"] },
            },
        },
        { $sort: { effectiveDate: -1 } },
    ];

    const [countResult, data] = await Promise.all([
        historyEnpenseModel.aggregate([...pipeline, { $count: "total" }]),
        historyEnpenseModel.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: limitNum },
            ...categoryLookupStages(),
        ]),
    ]);

    const total = countResult[0]?.total ?? 0;
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
    const baseMatch = {
        ...buildUserFilter(userId, categoryId),
        ...buildEffectiveDateRangeMatch(new Date(start), new Date(end), true),
    };

    return historyEnpenseModel.aggregate([
        { $match: baseMatch },
        {
            $addFields: {
                effectiveDate: { $ifNull: ["$transactionDate", "$createdAt"] },
            },
        },
        { $sort: { effectiveDate: -1 } },
        ...categoryLookupStages(),
    ]);
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
