const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const RoomSchema = mongoose.Schema({
  room_no: {
    type:String,
    require:true
  },
  room_location:{
    type: String
  },
  num_of_sharing:{
    type: Number,
    require:true
  },
  room_image:{
    type:String,
    require:true
  },
  room_facility:{
    type: Array,
    default:[],
  },
  room_mates:[
    {type:objectId ,ref:"pg_user"}
  ],
},{ 
  timestamps: { 
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  } 
});

module.exports = mongoose.model("pg_room",RoomSchema);