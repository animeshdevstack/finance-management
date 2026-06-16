const itemModel = require("../model/item.model");
const historyEnpenseModel = require("../model/history-enpense.model");

const createItemServices = async (Name, MonthYear, Amount, userId) => {
    if (!Name || !MonthYear || !userId) {
        throw new Error("All fields are required");
    }

    const totalAmount = Amount != null && Amount !== "" ? Number(Amount) : 0;
    const item = new itemModel({ Name, MonthYear, TotalAmount: totalAmount, userId });
    await item.save();

    if (totalAmount !== 0) {
        await historyEnpenseModel.create({
            UserId: userId,
            ItemId: item._id,
            Amount: totalAmount,
        });
    }

    return item;
}

const getAllItemsServices = async (userId) => {
    return itemModel.find({ userId }).sort({ createdAt: -1 });
}

const getItemByIdServices = async (id, userId) => {
    const item = await itemModel.findById(id);
    if (!item) {
        throw new Error("Item not found");
    }
    if (item.userId.toString() !== userId.toString()) {
        throw new Error("Unauthorized");
    }
    return item;
}

const updateItemMetadataServices = async (id, userId, { Name, MonthYear }) => {
    const item = await getItemByIdServices(id, userId);
    if (Name != null) item.Name = Name;
    if (MonthYear != null) item.MonthYear = MonthYear;
    await item.save();
    return item;
}

const removeItemServices = async (id, userId) => {
    await getItemByIdServices(id, userId);
    await historyEnpenseModel.deleteMany({ ItemId: id });
    return itemModel.findByIdAndDelete(id);
}

module.exports = {
    createItemServices,
    getAllItemsServices,
    getItemByIdServices,
    updateItemMetadataServices,
    removeItemServices,
}
