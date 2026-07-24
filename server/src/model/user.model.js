const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: function () {
            return !this.Phone
        },
        unique: true,
        sparse: true
    },
    Phone: {
        type: String,
        required: function () {
            return !this.Email
        },
        unique: true,
        sparse: true
    },
    Otp: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("users", userSchema)
module.exports = userModel