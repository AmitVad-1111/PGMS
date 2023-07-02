const express = require("express");
const bodyParser = require("body-parser");
const path = require("path")
const ejs = require("ejs");
const dotenv = require("dotenv").config();
const mongoos = require("mongoose");
const app = express();

const PORT = process.env.PORT || 3000;

/**
 * App Routes
 * =============================================================
 */
const authRoutes = require("./routes/AuthRoutes");

/**
 * App Settings
 * =============================================================
 */
app.set("view engine","ejs");

/**
 * Middelwares
 * =============================================================
 */
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.use(authRoutes);



mongoos.connect(process.env.DB_PTAH)
.then(result => {
    console.log("databese connected")

    app.listen(PORT, ()=>{
        console.log(`App running at ${PORT}`);
    })

}).catch(err => {
    console.log(err);
})




