const mongoose = require("mongoose");
/**
 * userid
 * payment type
 * payment status
 * payment amount
 * payment currency
 * transection id (in case online payment)
 * additional comment
 */
const pgPaymentSchema = mongoose.Schema({
  person_id : {
    type: mongoose.Schema.Types.ObjectId,
    ref:"pg_users"
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

module.exports = mongoose.model("pg_payment",pgPaymentSchema);