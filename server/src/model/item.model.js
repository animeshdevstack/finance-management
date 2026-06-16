const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    MonthYear: {
        type: String,
        required: true
    },
    TotalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
},{
    timestamps: true
})

const itemModel = mongoose.model("items", itemSchema);
module.exports = itemModel;
