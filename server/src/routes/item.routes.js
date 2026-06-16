const Express = require("express");
const { createItem, getAllItems, getItemById, updateItem, removeItem } = require("../controller/item.controller");
const { verifyToken } = require("../helpers/middleware/auth.middleware");

const itemRouter = Express.Router();

itemRouter.use(verifyToken);
itemRouter.route("/").post(createItem).get(getAllItems);
itemRouter.route("/:id").get(getItemById).put(updateItem).delete(removeItem);

module.exports = itemRouter;
