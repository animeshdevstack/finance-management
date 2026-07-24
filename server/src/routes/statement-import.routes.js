const Express = require("express");
const multer = require("multer");
const {
    parseStatement,
    confirmStatementImport,
} = require("../controller/statement-import.controller");
const { verifyToken } = require("../helpers/middleware/auth.middleware");

const statementImportRouter = Express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            cb(new Error("Only PDF files are allowed"));
            return;
        }
        cb(null, true);
    },
});

statementImportRouter.use(verifyToken);
statementImportRouter.post("/parse", (req, res, next) => {
    upload.single("statement")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Invalid file upload",
            });
        }
        return parseStatement(req, res);
    });
});
statementImportRouter.post("/confirm", confirmStatementImport);

module.exports = statementImportRouter;
