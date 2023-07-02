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
    }
});

module.exports = mongoos.model("User",UserSchema);