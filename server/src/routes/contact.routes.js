const Express = require("express");
const { addContact, listContacts } = require("../controller/contact.controller");
const { verifyToken } = require("../helpers/middleware/auth.middleware");

const contactRouter = Express.Router();

contactRouter.use(verifyToken);
contactRouter.route("/").post(addContact).get(listContacts);

module.exports = contactRouter;
