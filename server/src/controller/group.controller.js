const {
    createGroupServices,
    listGroupsServices,
    getGroupDetailServices,
} = require("../services/group.services");
const { getGroupBalancesServices } = require("../services/shared-expense.services");

const getUserId = (req) => req.user.data.userId;

function getErrorStatus(error) {
    const message = error.message || "";
    if (/not a member|not found|required|invalid|duplicate|must be|must have/i.test(message)) {
        return message.includes("not a member") ? 403 : 400;
    }
    return 500;
}

const createGroup = async (req, res) => {
    try {
        const userId = getUserId(req);
        const group = await createGroupServices(userId, req.body);
        return res.status(200).json({
            success: true,
            message: "Group created successfully",
            group,
        });
    } catch (error) {
        const status = getErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Failed to create group" : error.message,
            error: error.message,
        });
    }
};

const listGroups = async (req, res) => {
    try {
        const userId = getUserId(req);
        const groups = await listGroupsServices(userId);
        return res.status(200).json({
            success: true,
            message: "Groups fetched successfully",
            groups,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch groups",
            error: error.message,
        });
    }
};

const getGroupById = async (req, res) => {
    try {
        const userId = getUserId(req);
        const group = await getGroupDetailServices(req.params.id, userId);
        return res.status(200).json({
            success: true,
            message: "Group fetched successfully",
            group,
        });
    } catch (error) {
        const status = getErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Failed to fetch group" : error.message,
            error: error.message,
        });
    }
};

const getGroupBalances = async (req, res) => {
    try {
        const userId = getUserId(req);
        const balances = await getGroupBalancesServices(req.params.id, userId);
        return res.status(200).json({
            success: true,
            message: "Group balances fetched successfully",
            ...balances,
        });
    } catch (error) {
        const status = getErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Failed to fetch balances" : error.message,
            error: error.message,
        });
    }
};

module.exports = {
    createGroup,
    listGroups,
    getGroupById,
    getGroupBalances,
};
