const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

categorySchema.index({ userId: 1, Name: 1 });

const categoryModel = mongoose.model("categories", categorySchema);
module.exports = categoryModel;
