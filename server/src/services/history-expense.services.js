const historyEnpenseModel = require("../model/history-enpense.model");
const itemModel = require("../model/item.model");
const { getItemByIdServices } = require("./item.services");

const adjustItemTotal = async (itemId, delta) => {
    const item = await itemModel.findById(itemId);
    if (!item) {
        throw new Error("Item not found");
    }
    item.TotalAmount = (item.TotalAmount || 0) + delta;
    await item.save();
    return item;
}

const createHistoryExpenseServices = async (userId, itemId, amount) => {
    if (!itemId || amount == null || amount === "") {
        throw new Error("itemId and amount are required");
    }

    const numericAmount = Number(amount);
    await getItemByIdServices(itemId, userId);

    const historyExpense = await historyEnpenseModel.create({
        UserId: userId,
        ItemId: itemId,
        Amount: numericAmount,
    });

    await adjustItemTotal(itemId, numericAmount);
    return historyExpense;
}

const getAllHistoryExpenseServices = async (userId, itemId) => {
    const filter = { UserId: userId };
    if (itemId) {
        filter.ItemId = itemId;
    }
    return historyEnpenseModel.find(filter).sort({ createdAt: -1 }).populate("ItemId", "Name MonthYear");
}

const getHistoryExpenseByIdServices = async (id, userId) => {
    const historyExpense = await historyEnpenseModel.findById(id).populate("ItemId", "Name MonthYear");
    if (!historyExpense) {
        throw new Error("History expense not found");
    }
    if (historyExpense.UserId.toString() !== userId.toString()) {
        throw new Error("Unauthorized");
    }
    return historyExpense;
}

const updateHistoryExpenseServices = async (id, userId, Amount) => {
    const prevHistoryExpense = await getHistoryExpenseByIdServices(id, userId);
    const prevAmount = prevHistoryExpense.Amount || 0;
    const newAmount = Number(Amount);
    const difference = newAmount - prevAmount;

    const updatedHistoryExpense = await historyEnpenseModel.findByIdAndUpdate(
        id,
        { Amount: newAmount },
        { new: true }
    );

    if (difference !== 0) {
        await adjustItemTotal(prevHistoryExpense.ItemId, difference);
    }

    return updatedHistoryExpense;
}

const deleteHistoryExpenseServices = async (id, userId) => {
    const historyExpense = await getHistoryExpenseByIdServices(id, userId);
    await adjustItemTotal(historyExpense.ItemId, -(historyExpense.Amount || 0));
    return historyEnpenseModel.findByIdAndDelete(id);
}

module.exports = {
    createHistoryExpenseServices,
    getAllHistoryExpenseServices,
    getHistoryExpenseByIdServices,
    updateHistoryExpenseServices,
    deleteHistoryExpenseServices,
}
