const contactModel = require("../model/contact.model");
const userModel = require("../model/user.model");
const { resolveUserByPhone } = require("./user-resolver.services");
const { resolveAccountState } = require("../helpers/account-state.helper");
const { maskPhone } = require("../helpers/phone.utils");
const {
    assertNonEmptyString,
    assertValidPhone,
} = require("../validators/money-split.validators");

function formatContact(contact, linkedUser) {
    return {
        _id: contact._id,
        displayName: contact.displayName,
        phone: contact.phone,
        phoneMasked: maskPhone(contact.phone),
        linkedUserId: contact.linkedUserId,
        linkedUser: linkedUser
            ? {
                  _id: linkedUser._id,
                  Name: linkedUser.Name,
                  accountState: resolveAccountState(linkedUser),
              }
            : null,
        createdAt: contact.createdAt,
    };
}

async function addContactServices(ownerUserId, data) {
    const displayName = assertNonEmptyString(data.displayName, "Display name");
    const phone = assertValidPhone(data.phone);

    const linkedUser = await resolveUserByPhone(phone, {
        createdByUserId: ownerUserId,
        displayName,
    });

    const contact = await contactModel.findOneAndUpdate(
        { ownerUserId, phone },
        {
            ownerUserId,
            phone,
            displayName,
            linkedUserId: linkedUser._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return formatContact(contact, linkedUser);
}

async function listContactsServices(ownerUserId) {
    const contacts = await contactModel
        .find({ ownerUserId })
        .sort({ displayName: 1 });

    const userIds = contacts.map((contact) => contact.linkedUserId);
    const users = await userModel.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((user) => [String(user._id), user]));

    return contacts.map((contact) =>
        formatContact(contact, userMap.get(String(contact.linkedUserId)))
    );
}

module.exports = {
    addContactServices,
    listContactsServices,
};
