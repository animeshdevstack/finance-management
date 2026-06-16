const mongoose = require('mongoose');
const configuration = require('../config/configuration');
const logger = require('../helpers/logger');

const Connection = () => {
    mongoose.connect(configuration.MONGOURI).then(()=>{
        logger.log("successfully connected with the database");
        
    }).catch((error)=>{
        logger.log("failed to connect with the database", error.message);
    })
}

module.exports = Connection;
