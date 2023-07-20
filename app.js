const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const ejs = require("ejs");
const dotenv = require("dotenv").config();
const mongoos = require("mongoose");
const ErrorHendler = require("./middelware/error-handler");
const { session, config } = require("./middelware/session-collection");
const app = express();

const PORT = process.env.PORT || 3000;

/**
 * App Routes
 * =============================================================
 */
const authRoutes = require("./routes/AuthRoutes");
const adminRoutes = require("./routes/DashBoard");


/**
 * App Settings
 * =============================================================
 */
app.set("view engine", "ejs");

/**
 * Middelwares
 * =============================================================
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static("node_modules"));
app.use(session(config));
app.use(authRoutes);
app.use("/dashboard", adminRoutes);
app.use(ErrorHendler);

mongoos.connect(process.env.DB_PTAH_LOCAL)
    .then(result => {
        console.log("databese connected")

        app.listen(PORT, () => {
            console.log(`App running at ${PORT}`);
        })

    }).catch(err => {
        console.log(err);
    })




