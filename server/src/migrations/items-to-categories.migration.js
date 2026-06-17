const mongoose = require("mongoose");
const userModel = require("../model/user.model");
const categoryModel = require("../model/category.model");
const { seedDefaultCategories } = require("../services/category.services");
const logger = require("../helpers/logger");

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function migrateItemsToCategories() {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (!collectionNames.includes("items")) {
        const users = await userModel.find().select("_id");
        for (const user of users) {
            await seedDefaultCategories(user._id);
        }
        return;
    }

    const itemsCol = db.collection("items");
    const expensesCol = db.collection("historyEnpenses");

    const items = await itemsCol.find().toArray();
    const itemIdToCategoryId = new Map();

    for (const item of items) {
        const userId = item.userId;
        const name = item.Name;

        let category = await categoryModel.findOne({
            userId,
            Name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
        });

        if (!category) {
            category = await categoryModel.create({
                Name: name,
                userId,
                isDefault: false,
            });
        }

        itemIdToCategoryId.set(item._id.toString(), category._id);
    }

    const expenses = await expensesCol.find({}).toArray();

    for (const expense of expenses) {
        const updates = {};
        const unset = {};

        if (expense.ItemId && !expense.CategoryId) {
            const categoryId = itemIdToCategoryId.get(expense.ItemId.toString());
            if (categoryId) {
                updates.CategoryId = categoryId;
                unset.ItemId = "";
            }
        }

        if (expense.Description == null || expense.Description === undefined) {
            updates.Description = "";
        }

        const updateOp = {};
        if (Object.keys(updates).length > 0) updateOp.$set = updates;
        if (Object.keys(unset).length > 0) updateOp.$unset = unset;

        if (Object.keys(updateOp).length > 0) {
            await expensesCol.updateOne({ _id: expense._id }, updateOp);
        }
    }

    const users = await userModel.find().select("_id");
    for (const user of users) {
        await seedDefaultCategories(user._id);
    }

    await itemsCol.drop();
    logger.log("Migration complete: items collection migrated to categories");
}

module.exports = { migrateItemsToCategories };
