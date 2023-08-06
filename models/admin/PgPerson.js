const mongoose = require("mongoose");
const PgPayment = require("../admin/PgPayment");
const ObjectId = mongoose.Schema.Types.ObjectId;

const PgPersonSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  gender: {
    type: String,
  },
  dob: {
    type: Date,
  },
  doc_type: {
    type: String,
  },
  doc_front: {
    type: String,
  },
  doc_back: {
    type: String,
  },
  profile_image: {
    type: String,
  },
  mobile_no: {
    type: String,
  },
  is_mobile_verified: {
    type: Boolean,
  },
  address_line1: {
    type: String,
  },
  address_line2: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  zipcode: {
    type: String,
  },
  guardian_fullName: {
    type: String,
  },
  guardian_email: {
    type: String,
  },
  guardian_gender: {
    type: String,
  },
  guardian_doc_type: {
    type: String,
  },
  guardian_doc_front: {
    type: String,
  },
  guardian_doc_back: {
    type: String,
  },
  guardian_mobile_no: {
    type: String,
  },
  guardian_is_mobile_verified: {
    type: Boolean,
  },
  guardian_address_line1: {
    type: String,
  },
  guardian_address_line2: {
    type: String,
  },
  guardian_city: {
    type: String,
  },
  guardian_state: {
    type: String,
  },
  guardian_country: {
    type: String,
  },
  guardian_zipcode: {
    type: String,
  },
  person_payments:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"pg_payment"
  }],
  person_deposit:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"pg_payment"
  },
  room_number: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

/******************************************************************************************
 * Middelware 
 * Delete payment from payment collection if any the person remove from the collection
 ******************************************************************************************/
PgPersonSchema.pre("deleteOne", async function(next){
  try{
    const updatedDoc = await this.model.findOne(this.getQuery());
    if(updatedDoc){
      const removePay = await PgPayment.deleteMany({person_id: updatedDoc._id});
    }
    next();
  }catch(err){
    if(!err.statusCode){
      err.statusCode = 500;
    }
    throw new Error(err);
  }
});


module.exports = mongoose.model("pg_user", PgPersonSchema);