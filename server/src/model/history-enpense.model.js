const mongoose = require("mongoose");

const historyEnpenseSchema = new mongoose.Schema({
    CategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        required: true,
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    Amount: {
        type: Number,
        required: true,
        default: 0,
    },
    Description: {
        type: String,
        required: true,
        default: "",
    },
}, {
    timestamps: true,
});

const historyEnpenseModel = mongoose.model("historyExpenses", historyEnpenseSchema);
module.exports = historyEnpenseModel;
