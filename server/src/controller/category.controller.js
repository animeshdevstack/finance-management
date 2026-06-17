const {
    createCategoryServices,
    getCategoriesWithMonthTotalsServices,
    getCategoryByIdServices,
    updateCategoryServices,
    removeCategoryServices,
    getCurrentMonthYear,
} = require("../services/category.services");

const getUserId = (req) => req.user.data.userId;

const createCategory = async (req, res) => {
    try {
        const { Name } = req.body;
        const userId = getUserId(req);
        const category = await createCategoryServices(Name, userId);
        return res.status(200).json({
            success: true,
            message: "Category created successfully",
            category,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create category",
            error: error.message,
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const userId = getUserId(req);
        const monthYear = req.query.monthYear || getCurrentMonthYear();
        const categories = await getCategoriesWithMonthTotalsServices(userId, monthYear);
        return res.status(200).json({
            success: true,
            message: "All categories fetched successfully",
            categories,
            monthYear,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all categories",
            error: error.message,
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const category = await getCategoryByIdServices(id, userId);
        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            category,
        });
    } catch (error) {
        const status = error.message === "Unauthorized" ? 403 : error.message === "Category not found" ? 404 : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to fetch category",
            error: error.message,
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { Name } = req.body;
        const userId = getUserId(req);
        const category = await updateCategoryServices(id, userId, { Name });
        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
        });
    } catch (error) {
        const status =
            error.message === "Unauthorized" ? 403
            : error.message === "Category not found" ? 404
            : error.message === "Default categories cannot be renamed" ? 400
            : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to update category",
            error: error.message,
        });
    }
};

const removeCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);
        const category = await removeCategoryServices(id, userId);
        return res.status(200).json({
            success: true,
            message: "Category removed successfully",
            category,
        });
    } catch (error) {
        const status =
            error.message === "Unauthorized" ? 403
            : error.message === "Category not found" ? 404
            : error.message === "Default categories cannot be deleted" ? 400
            : 500;
        return res.status(status).json({
            success: false,
            message: "Failed to remove category",
            error: error.message,
        });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    removeCategory,
};
