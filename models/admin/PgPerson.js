const mongoose = require("mongoose");
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
  room_number: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});


module.exports = mongoose.model("pg_user", PgPersonSchema);