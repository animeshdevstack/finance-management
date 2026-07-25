const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    ownerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    linkedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
}, {
    timestamps: true,
});

contactSchema.index({ ownerUserId: 1, phone: 1 }, { unique: true });

const contactModel = mongoose.model("contacts", contactSchema);
module.exports = contactModel;
