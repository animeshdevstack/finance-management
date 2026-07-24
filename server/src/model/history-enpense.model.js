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
    transactionDate: {
        type: Date,
        required: false,
    },
}, {
    timestamps: true,
});

historyEnpenseSchema.index({ UserId: 1, createdAt: -1 });
historyEnpenseSchema.index({ UserId: 1, transactionDate: -1 });

const historyEnpenseModel = mongoose.model("historyExpenses", historyEnpenseSchema);
module.exports = historyEnpenseModel;
