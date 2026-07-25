const groupModel = require("../model/group.model");
const groupMemberModel = require("../model/group-member.model");
const contactModel = require("../model/contact.model");
const sharedExpenseModel = require("../model/shared-expense.model");
const userModel = require("../model/user.model");
const { resolveUserByPhone } = require("./user-resolver.services");
const { resolveAccountState } = require("../helpers/account-state.helper");
const { maskPhone } = require("../helpers/phone.utils");
const {
    assertGroupType,
    assertDirectMemberCount,
    assertGroupMemberCount,
    assertUniqueMemberIds,
    assertNonEmptyString,
    assertValidObjectId,
    assertValidPhone,
} = require("../validators/money-split.validators");

async function getMemberUserIds(groupId) {
    const members = await groupMemberModel.find({ groupId }).select("userId");
    return members.map((member) => String(member.userId));
}

async function assertGroupMember(groupId, userId) {
    assertValidObjectId(groupId, "group id");
    const membership = await groupMemberModel.findOne({ groupId, userId });
    if (!membership) {
        throw new Error("You are not a member of this group");
    }
    return membership;
}

async function findExistingDirectGroup(userIdA, userIdB) {
    const memberships = await groupMemberModel.find({
        userId: { $in: [userIdA, userIdB] },
    });

    const groupCounts = new Map();
    for (const membership of memberships) {
        const key = String(membership.groupId);
        groupCounts.set(key, (groupCounts.get(key) || 0) + 1);
    }

    const sharedGroupIds = [...groupCounts.entries()]
        .filter(([, count]) => count === 2)
        .map(([groupId]) => groupId);

    if (sharedGroupIds.length === 0) return null;

    return groupModel.findOne({
        _id: { $in: sharedGroupIds },
        type: "direct",
    });
}

async function formatMember(userId, role) {
    const user = await userModel.findById(userId);
    if (!user) return null;

    return {
        userId: user._id,
        Name: user.Name,
        Phone: user.Phone ? maskPhone(user.Phone) : null,
        role,
        accountState: resolveAccountState(user),
    };
}

async function resolveMembersFromContacts(creatorId, memberContactIds) {
    const entries = [];

    for (const contactId of memberContactIds) {
        assertValidObjectId(contactId, "contact id");
        const contact = await contactModel.findOne({
            _id: contactId,
            ownerUserId: creatorId,
        });

        if (!contact) {
            throw new Error("One or more selected contacts were not found");
        }

        entries.push({
            phone: contact.phone,
            displayName: contact.displayName,
        });
    }

    return entries;
}

async function createGroupServices(creatorId, data) {
    const type = assertGroupType(data.type);
    const name = assertNonEmptyString(data.name, "Group name");
    const memberPhones = Array.isArray(data.memberPhones) ? data.memberPhones : [];
    const memberContactIds = Array.isArray(data.memberContactIds)
        ? data.memberContactIds
        : [];

    const creator = await userModel.findById(creatorId);
    if (!creator?.Phone) {
        throw new Error("Your account must have a phone number to create splits");
    }

    const contactEntries = await resolveMembersFromContacts(creatorId, memberContactIds);
    const allPhoneEntries = [...contactEntries, ...memberPhones];
    const seenPhones = new Set();
    const resolvedMemberIds = [String(creatorId)];

    for (const entry of allPhoneEntries) {
        const phone = assertValidPhone(entry.phone || entry);
        if (seenPhones.has(phone)) {
            continue;
        }
        seenPhones.add(phone);

        const displayName = entry.displayName || "User";
        const user = await resolveUserByPhone(phone, {
            createdByUserId: creatorId,
            displayName,
        });
        resolvedMemberIds.push(String(user._id));
    }

    assertUniqueMemberIds(resolvedMemberIds);

    if (type === "direct") {
        assertDirectMemberCount(resolvedMemberIds);
        const existing = await findExistingDirectGroup(
            resolvedMemberIds[0],
            resolvedMemberIds[1]
        );
        if (existing) {
            return getGroupDetailServices(existing._id, creatorId);
        }
    } else {
        assertGroupMemberCount(resolvedMemberIds);
    }

    const group = await groupModel.create({
        name,
        type,
        createdBy: creatorId,
    });

    const memberDocs = resolvedMemberIds.map((userId) => ({
        groupId: group._id,
        userId,
        role: String(userId) === String(creatorId) ? "owner" : "member",
    }));

    await groupMemberModel.insertMany(memberDocs);

    return getGroupDetailServices(group._id, creatorId);
}

async function getTotalSpentByGroupIds(groupIds) {
    if (groupIds.length === 0) {
        return new Map();
    }

    const totals = await sharedExpenseModel.aggregate([
        { $match: { groupId: { $in: groupIds } } },
        { $group: { _id: "$groupId", totalSpent: { $sum: "$totalAmount" } } },
    ]);

    return new Map(
        totals.map((entry) => [
            String(entry._id),
            Math.round(entry.totalSpent * 100) / 100,
        ])
    );
}

async function listGroupsServices(userId) {
    const memberships = await groupMemberModel.find({ userId });
    const groupIds = memberships.map((membership) => membership.groupId);

    const groups = await groupModel
        .find({ _id: { $in: groupIds } })
        .sort({ updatedAt: -1 });

    const totalSpentByGroup = await getTotalSpentByGroupIds(groupIds);

    return Promise.all(
        groups.map(async (group) => {
            const members = await groupMemberModel.find({ groupId: group._id });
            return {
                _id: group._id,
                name: group.name,
                type: group.type,
                memberCount: members.length,
                totalSpent: totalSpentByGroup.get(String(group._id)) || 0,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
            };
        })
    );
}

async function getGroupDetailServices(groupId, userId) {
    await assertGroupMember(groupId, userId);

    const group = await groupModel.findById(groupId);
    if (!group) {
        throw new Error("Group not found");
    }

    const members = await groupMemberModel.find({ groupId });
    const formattedMembers = (
        await Promise.all(
            members.map((member) => formatMember(member.userId, member.role))
        )
    ).filter(Boolean);

    const totalSpentByGroup = await getTotalSpentByGroupIds([group._id]);

    return {
        _id: group._id,
        name: group.name,
        type: group.type,
        createdBy: group.createdBy,
        members: formattedMembers,
        totalSpent: totalSpentByGroup.get(String(group._id)) || 0,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
    };
}

module.exports = {
    createGroupServices,
    listGroupsServices,
    getGroupDetailServices,
    assertGroupMember,
    getMemberUserIds,
};
