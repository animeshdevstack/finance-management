const mongoose = require("mongoose");

const historyEnpenseSchema = new mongoose.Schema({
    ItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "items",
        required: true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    Amount: {
        type: Number,
        required: true,
        default: 0
    },
},{
    timestamps: true
})

const historyEnpenseModel = mongoose.model("historyEnpenses", historyEnpenseSchema);
module.exports = historyEnpenseModel;
