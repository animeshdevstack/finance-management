const mongoose = require("mongoose");

const GROUP_TYPES = ["direct", "group"];

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: GROUP_TYPES,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
}, {
    timestamps: true,
});

const groupModel = mongoose.model("groups", groupSchema);

module.exports = groupModel;
module.exports.GROUP_TYPES = GROUP_TYPES;
