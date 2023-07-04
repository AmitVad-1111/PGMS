const mongoos = require("mongoose");

const UserSchema = new mongoos.Schema({
    fullName: {
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    user_roll:{
        type:String,
        required:true
    },
    password_reset_link:{
        type: String
    },
    password_reset_link_Exp:{
        type:Date
    }
});

module.exports = mongoos.model("User",UserSchema);