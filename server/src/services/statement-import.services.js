const { randomUUID } = require("crypto");
const categoryModel = require("../model/category.model");
const historyEnpenseModel = require("../model/history-enpense.model");
const { extractPdfText } = require("../helpers/pdf-text.extractor");
const { parseStatementText } = require("../parsers/statement-parser.registry");
const {
    assertSupportedBank,
    getBankConfig,
} = require("../constants/supported-banks");
const { UNCATEGORY } = require("../helpers/suggest-category");
const {
    seedDefaultCategories,
    createCategoryServices,
} = require("./category.services");

const parseStatementPdfServices = async (buffer, { bank = "icici", password } = {}) => {
    const normalizedBank = assertSupportedBank(bank);
    const bankConfig = getBankConfig(normalizedBank);

    if (bankConfig.requiresPassword && !password) {
        throw new Error("PDF password is required for this bank statement.");
    }

    const text = await extractPdfText(buffer, { password });
    const result = parseStatementText(normalizedBank, text);

    return {
        ...result,
        transactions: result.transactions.map((transaction) => ({
            id: randomUUID(),
            ...transaction,
            included: true,
        })),
    };
};

function normalizeCategoryName(name) {
    return String(name || UNCATEGORY).trim() || UNCATEGORY;
}

function parseLocalDateInput(dateInput) {
    if (dateInput instanceof Date) return dateInput;
    const match = String(dateInput).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return new Date(dateInput);
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function startOfDay(dateInput) {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
}

function endOfDay(dateInput) {
    const date = new Date(dateInput);
    date.setHours(23, 59, 59, 999);
    return date;
}

async function buildCategoryMap(userId) {
    await seedDefaultCategories(userId);
    const categories = await categoryModel.find({ userId });
    const map = new Map();

    for (const category of categories) {
        map.set(category.Name.toLowerCase(), category);
    }

    return map;
}

async function resolveCategoryId(categoryMap, categoryName, userId, stats) {
    const normalizedName = normalizeCategoryName(categoryName);
    const key = normalizedName.toLowerCase();
    let category = categoryMap.get(key);

    if (!category) {
        category = await createCategoryServices(normalizedName, userId);
        categoryMap.set(key, category);
        stats.categoriesCreated += 1;
    }

    return category._id;
}

async function isDuplicateExpense(userId, transactionDate, amount, description) {
    const dayStart = startOfDay(transactionDate);
    const dayEnd = endOfDay(transactionDate);
    const escapedDescription = description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const existing = await historyEnpenseModel.findOne({
        UserId: userId,
        Amount: amount,
        transactionDate: { $gte: dayStart, $lte: dayEnd },
        Description: { $regex: new RegExp(`^${escapedDescription}$`, "i") },
    });

    return Boolean(existing);
}

const confirmStatementImportServices = async (userId, transactions = []) => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        throw new Error("At least one transaction is required");
    }

    const stats = {
        imported: 0,
        skipped: 0,
        categoriesCreated: 0,
    };

    const categoryMap = await buildCategoryMap(userId);

    for (const row of transactions) {
        const description = String(row.description || "").trim();
        const amount = Number(row.amount);
        const transactionDate = parseLocalDateInput(row.date);

        if (!description || Number.isNaN(amount) || Number.isNaN(transactionDate.getTime())) {
            stats.skipped += 1;
            continue;
        }

        const duplicate = await isDuplicateExpense(userId, transactionDate, amount, description);
        if (duplicate) {
            stats.skipped += 1;
            continue;
        }

        const categoryId = await resolveCategoryId(
            categoryMap,
            row.categoryName,
            userId,
            stats
        );

        await historyEnpenseModel.create({
            UserId: userId,
            CategoryId: categoryId,
            Amount: amount,
            Description: description,
            transactionDate,
        });

        stats.imported += 1;
    }

    return stats;
};

module.exports = {
    parseStatementPdfServices,
    confirmStatementImportServices,
};
