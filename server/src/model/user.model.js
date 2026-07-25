const mongoose = require("mongoose");
const { Schema } = mongoose;

const ACCOUNT_STATES = ["pending", "active", "inactive"];

const userSchema = new Schema({
    Name: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: function () {
            return !this.Phone;
        },
        unique: true,
        sparse: true,
    },
    Phone: {
        type: String,
        required: function () {
            return !this.Email;
        },
        unique: true,
        sparse: true,
    },
    Otp: {
        type: Number,
        required: false,
    },
    accountState: {
        type: String,
        enum: ACCOUNT_STATES,
        default: "active",
    },
    lastLoginAt: {
        type: Date,
        default: null,
    },
    createdByUserId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
    isProfileComplete: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
module.exports.ACCOUNT_STATES = ACCOUNT_STATES;
