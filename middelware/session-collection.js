const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);


/**
 * Create Collection For Session Storeage
 * =============================================================
 */

const store = new MongoDBStore({
    uri: process.env.DB_SESSION_COLLECTION_URI,
    collection: 'sessions'
});


const config = {
    secret: process.env.DB_SESSION_SECRETE,
    resave: false,
    saveUninitialized: false,
    store: store
}

module.exports = {session, config};