const mongoose = require("mongoose");
const categoryModel = require("../model/category.model");
const historyEnpenseModel = require("../model/history-enpense.model");
const { DEFAULT_CATEGORIES } = require("../constants/default-categories");
const { buildEffectiveDateRangeMatch } = require("../helpers/expense-date.helper");

function getCurrentMonthYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function parseMonthYear(monthYear) {
    const [yearStr, monthStr] = monthYear.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!year || !month || month < 1 || month > 12) {
        throw new Error("Invalid monthYear format. Use YYYY-MM");
    }
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
}

const seedDefaultCategories = async (userId) => {
    const existing = await categoryModel.find({ userId, isDefault: true }).select("Name");
    const existingNames = new Set(existing.map((c) => c.Name.toLowerCase()));

    const toCreate = DEFAULT_CATEGORIES.filter(
        (name) => !existingNames.has(name.toLowerCase())
    );

    if (toCreate.length === 0) return;

    await categoryModel.insertMany(
        toCreate.map((Name) => ({ Name, userId, isDefault: true }))
    );
};

const getCategoryByIdServices = async (id, userId) => {
    const category = await categoryModel.findById(id);
    if (!category) {
        throw new Error("Category not found");
    }
    if (category.userId.toString() !== userId.toString()) {
        throw new Error("Unauthorized");
    }
    return category;
};

const getCategoriesWithMonthTotalsServices = async (userId, monthYear = getCurrentMonthYear()) => {
    await seedDefaultCategories(userId);

    const { start, end } = parseMonthYear(monthYear);

    const categories = await categoryModel.find({ userId }).sort({ isDefault: -1, Name: 1 });

    const totals = await historyEnpenseModel.aggregate([
        {
            $match: {
                UserId: new mongoose.Types.ObjectId(userId),
                ...buildEffectiveDateRangeMatch(start, end),
            },
        },
        {
            $group: {
                _id: "$CategoryId",
                monthTotal: { $sum: "$Amount" },
                lastActivity: { $max: { $ifNull: ["$transactionDate", "$createdAt"] } },
            },
        },
    ]);

    const totalsMap = new Map(
        totals.map((t) => [t._id.toString(), { monthTotal: t.monthTotal || 0, lastActivity: t.lastActivity }])
    );

    return categories.map((category) => {
        const stats = totalsMap.get(category._id.toString());
        return {
            ...category.toObject(),
            monthTotal: stats?.monthTotal ?? 0,
            lastActivity: stats?.lastActivity ?? null,
        };
    });
};

const createCategoryServices = async (Name, userId) => {
    if (!Name || !userId) {
        throw new Error("Name is required");
    }

    const trimmedName = Name.trim();
    if (!trimmedName) {
        throw new Error("Name is required");
    }

    const duplicate = await categoryModel.findOne({
        userId,
        Name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (duplicate) {
        throw new Error("A category with this name already exists");
    }

    const category = new categoryModel({
        Name: trimmedName,
        userId,
        isDefault: false,
    });
    await category.save();
    return category;
};

const updateCategoryServices = async (id, userId, { Name }) => {
    const category = await getCategoryByIdServices(id, userId);
    if (category.isDefault) {
        throw new Error("Default categories cannot be renamed");
    }

    if (Name != null) {
        const trimmedName = Name.trim();
        if (!trimmedName) {
            throw new Error("Name is required");
        }

        const duplicate = await categoryModel.findOne({
            userId,
            _id: { $ne: id },
            Name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        });
        if (duplicate) {
            throw new Error("A category with this name already exists");
        }

        category.Name = trimmedName;
    }

    await category.save();
    return category;
};

const removeCategoryServices = async (id, userId) => {
    const category = await getCategoryByIdServices(id, userId);
    if (category.isDefault) {
        throw new Error("Default categories cannot be deleted");
    }

    await historyEnpenseModel.deleteMany({ CategoryId: id });
    return categoryModel.findByIdAndDelete(id);
};

module.exports = {
    seedDefaultCategories,
    getCategoryByIdServices,
    getCategoriesWithMonthTotalsServices,
    createCategoryServices,
    updateCategoryServices,
    removeCategoryServices,
    getCurrentMonthYear,
};
