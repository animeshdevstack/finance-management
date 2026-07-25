const mongoose = require("mongoose");

const sharedExpenseSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groups",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: "",
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paidByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    expenseDate: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
}, {
    timestamps: true,
});

sharedExpenseSchema.index({ groupId: 1, expenseDate: -1 });

const sharedExpenseModel = mongoose.model("shared_expenses", sharedExpenseSchema);
module.exports = sharedExpenseModel;
