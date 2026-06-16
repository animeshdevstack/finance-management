const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    Name: {
        type: String,
        require: true
    },
    Email: {
        type: String,
        require: function () {
            return !this.Phone
        },
        unique: true
    },
    Phone: {
        type: String,
        require: function () {
            return this.Email
        },
        unique: true
    },
    Otp: {
        type: Number,
        require: false
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("users", userSchema)
module.exports = userModel