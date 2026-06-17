const mongoose = require('mongoose');
const configuration = require('../config/configuration');
const logger = require('../helpers/logger');
const { migrateItemsToCategories } = require('../migrations/items-to-categories.migration');

const Connection = () => {
    mongoose.connect(configuration.MONGOURI).then(async () => {
        logger.log("successfully connected with the database");
        try {
            await migrateItemsToCategories();
        } catch (error) {
            logger.error("Migration failed:", error.message);
        }
    }).catch((error) => {
        logger.log("failed to connect with the database", error.message);
    });
};

module.exports = Connection;
