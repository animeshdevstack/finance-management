const {
    addContactServices,
    listContactsServices,
} = require("../services/contact.services");

const getUserId = (req) => req.user.data.userId;

function getErrorStatus(error) {
    const message = error.message || "";
    if (/not a member|not found|required|invalid|duplicate|must be|only the group owner/i.test(message)) {
        return message.includes("not a member") ? 403 : 400;
    }
    return 500;
}

const addContact = async (req, res) => {
    try {
        const userId = getUserId(req);
        const contact = await addContactServices(userId, req.body);
        return res.status(200).json({
            success: true,
            message: "Contact saved successfully",
            contact,
        });
    } catch (error) {
        const status = getErrorStatus(error);
        return res.status(status).json({
            success: false,
            message: status === 500 ? "Failed to save contact" : error.message,
            error: error.message,
        });
    }
};

const listContacts = async (req, res) => {
    try {
        const userId = getUserId(req);
        const contacts = await listContactsServices(userId);
        return res.status(200).json({
            success: true,
            message: "Contacts fetched successfully",
            contacts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch contacts",
            error: error.message,
        });
    }
};

module.exports = {
    addContact,
    listContacts,
};
