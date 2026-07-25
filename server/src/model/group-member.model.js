const mongoose = require("mongoose");

const MEMBER_ROLES = ["owner", "member"];

const groupMemberSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groups",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    role: {
        type: String,
        enum: MEMBER_ROLES,
        default: "member",
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

groupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
groupMemberSchema.index({ userId: 1 });

const groupMemberModel = mongoose.model("group_members", groupMemberSchema);

module.exports = groupMemberModel;
module.exports.MEMBER_ROLES = MEMBER_ROLES;
