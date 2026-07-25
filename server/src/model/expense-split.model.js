const mongoose = require("mongoose");

const expenseSplitSchema = new mongoose.Schema({
    expenseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shared_expenses",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    owedAmount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

expenseSplitSchema.index({ expenseId: 1, userId: 1 }, { unique: true });
expenseSplitSchema.index({ userId: 1 });

const expenseSplitModel = mongoose.model("expense_splits", expenseSplitSchema);
module.exports = expenseSplitModel;
