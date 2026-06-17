const Express = require("express");
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    removeCategory,
} = require("../controller/category.controller");
const { verifyToken } = require("../helpers/middleware/auth.middleware");

const categoryRouter = Express.Router();

categoryRouter.use(verifyToken);
categoryRouter.route("/").post(createCategory).get(getAllCategories);
categoryRouter.route("/:id").get(getCategoryById).put(updateCategory).delete(removeCategory);

module.exports = categoryRouter;
