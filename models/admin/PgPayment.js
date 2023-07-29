const mongoose = require("mongoose");

const pgPaymentSchema = mongoose.Schema({
  person_id : {
    type: mongoose.Schema.Types.ObjectId,
    ref:"pg_user"
  },
  payment_type:{
    type: String,
    required:true
  },
  payment_status:{
    type:String,
    required:true
  },
  payment_amount:{
    type: mongoose.Schema.Types.Decimal128,
    required:true
  },
  payment_currency:{
    type:String,
    required:true
  },
  is_rent:{
    type:Boolean
  },
  is_deposit:{
    type:Boolean
  },
  transection_id:{
    type:String,
  },
  additional_comment:{
    type:String
  },
},{ 
    timestamps: { 
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    } 
});

pgPaymentSchema.static("getPaymentByUserId", async function(id){
  if(id){
    return await mongoose.model("pg_payment").find({person_id:id});
  }
  return null;
})

module.exports = mongoose.model("pg_payment",pgPaymentSchema);