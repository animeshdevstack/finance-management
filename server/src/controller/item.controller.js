const {
    createItemServices,
    getAllItemsServices,
    getItemByIdServices,
    updateItemMetadataServices,
    removeItemServices,
} = require("../services/item.services");

const getUserId = (req) => req.user.data.userId;

const createItem = async (req, res) => {
    try {
        const { Name, MonthYear, Amount } = req.body;
        const userId = getUserId(req);
        const item = await createItemServices(Name, MonthYear, Amount, userId);
        return res.status(200).json({
            success: true,
            message: "Item created successfully",
            item,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create item",
            error: error.message,
        });
    }
}

const getAllItems = async (req, res) => {
    try {
        const userId = getUserId(req);
        const items = await getAllItemsServices(userId);
        return res.status(200).json({
            success: true,
            message: "All items fetched successfully",
            items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all items",
            error: error.message,
        });
    }
}

const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const item = await getItemByIdServices(id, userId);
        return res.status(200).json({
            success: true,
            message: "Item fetched successfully",
            item,
        });
    } catch (error) {
        const status = error.message === "Unauthorized" ? 403 : error.message === "Item not found" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to fetch item",
            error: error.message,
        });
    }
}

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, MonthYear } = req.body;
        const userId = getUserId(req);
        const item = await updateItemMetadataServices(id, userId, { Name, MonthYear });
        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            item,
        });
    } catch (error) {
        const status = error.message === "Unauthorized" ? 403 : error.message === "Item not found" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to update item",
            error: error.message,
        });
    }
}

const removeItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const item = await removeItemServices(id, userId);
        return res.status(200).json({
            success: true,
            message: "Item removed successfully",
            item,
        });
    } catch (error) {
        const status = error.message === "Unauthorized" ? 403 : error.message === "Item not found" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to remove item",
            error: error.message,
        });
    }
}

module.exports = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    removeItem,
}
