const PgPerson = require("../../models/admin/PgPerson");
const PgPayment = require("../../models/admin/PgPayment");
const Payments = require("../../utils/admin/payments");

function formatDate(date) {
  let m = date.getMonth() + 1;
  let d = date.getDate();
  return `${date.getFullYear()}-${m > 9 ? m : '0' + m}-${d > 9 ? d : '0' + d}`;
}


class Person {
  constructor(personid = null) {
    this.personId = personid;
    this.payment = new Payments(this.personId);
    this.personDetails = {
      "person-fullname": "",
      "person-email": "",
      "person-gender": "",
      "person-dob": "",
      "person-doc-type": "",
      "person-doc-front": "",
      "person-doc-back": "",
      "person-image": "",
      "person-mobile": "",
      "person-mobile-verified": "",
      "person-address-ln1": "",
      "person-address-ln2": "",
      "person-city": "",
      "person-state": "",
      "person-country": "",
      "person-zipcode": "",
    }

    this.guardianDetails = {
      "person2-fullname": "",
      "person2-email": "",
      "person2-gender": "",
      "person2-doc-type": "",
      "person2-doc-front": "",
      "person2-doc-back": "",
      "person2-mobile": "",
      "person2-mobile-verified": "",
      "person2-address-ln1": "",
      "person2-address-ln2": "",
      "person2-city": "",
      "person2-state": "",
      "person2-country": "",
      "person2-zipcode": "",
    }

    this.thisPerson = null;
  }

  async addPersonalDetails(pd) {
    if (Object.keys(pd).length) {
      /**
       * Check this person already registered
       */
      if (this.personId == null) {
        const p = new PgPerson({
          fullName: pd["person-fullname"],
          email: pd["person-email"],
          gender: pd["person-gender"],
          dob: new Date(pd["person-dob"]),
          doc_type: pd["person-doc-type"],
          doc_front: pd["person-doc-front"],
          doc_back: pd["person-doc-back"] || '',
          profile_image: pd["person-image"],
          mobile_no: pd["person-mobile"],
          is_mobile_verified: pd["person-mobile-verified"],
          address_line1: pd["person-address-ln1"],
          address_line2: pd["person-address-ln2"],
          city: pd["person-city"],
          state: pd["person-state"],
          country: pd["person-country"],
          zipcode: pd["person-zipcode"],
        });

        try {
          const row = await p.save();
          if (row) {
            this.personId = row._id;
            return this.personId.toString();
          }
        } catch (err) {
          throw new Error(err);
        }

      } else {
        //update the person with new data
        this.editPersonalDetails(pd);
      }


    } else {
      throw new Error("Please provide personal details")
    }
  }

  async getPersonalDetails() {
    if (this.personId) {
      try {
        const gp = await PgPerson.findById(this.personId);
        if (gp) {
          this.personDetails = {
            "id": gp._id,
            "person-fullname": gp.fullName,
            "person-email": gp.email,
            "person-gender": gp.gender,
            "person-dob": formatDate(new Date(gp.dob)),
            "person-doc-type": gp.doc_type,
            "person-doc-front": gp.doc_front,
            "person-doc-back": gp.doc_back,
            "person-image": gp.profile_image,
            "person-mobile": gp.mobile_no,
            "person-mobile-verified": gp.is_mobile_verified,
            "person-address-ln1": gp.address_line1,
            "person-address-ln2": gp.address_line2,
            "person-city": gp.city,
            "person-state": gp.state,
            "person-country": gp.country,
            "person-zipcode": gp.zipcode,
          }
          return this.personDetails;
        }

      } catch (err) {
        throw new Error(err);
      }
    }
  }

  /**
   * Edit Person Details
   */
  async editPersonalDetails(pd) {
    if (this.personId) {
      try {
        const j = await PgPerson.findById(this.personId);
        if (j) {
          j.fullName = pd["person-fullname"]
          j.email = pd["person-email"]
          j.gender = pd["person-gender"]
          j.dob = new Date(pd["person-dob"])
          j.doc_type = pd["person-doc-type"]
          j.doc_front = pd["person-doc-front"]
          j.doc_back = pd["person-doc-back"] || ''
          j.profile_image = pd["person-image"]
          j.mobile_no = pd["person-mobile"]
          j.is_mobile_verified = pd["person-mobile-verified"]
          j.address_line1 = pd["person-address-ln1"]
          j.address_line2 = pd["person-address-ln2"]
          j.city = pd["person-city"]
          j.state = pd["person-state"]
          j.country = pd["person-country"]
          j.zipcode = pd["person-zipcode"]

          let isupdated = await j.save();
          return isupdated;
          // console.log("updated successfully:>>>>>>>>>>>>>", isupdated);
        }

      } catch (err) {
        throw new Error(err);
      }
    } else {
      throw new Error("Please provide user id");
    }
  }

  /**
   * Add or edit gaurdian details
   */
  async addEditGuardianDetails(pd) {
    if (this.personId) {
      try {
        const j = await PgPerson.findById(this.personId);
        console.log("addEditGuardianDetails >>>>>>>>", j)
        if (j) {
          j.guardian_fullName = pd["person2-fullname"]
          j.guardian_email = pd["person2-email"]
          j.guardian_gender = pd["person2-gender"]
          j.guardian_dob = new Date(pd["person2-dob"])
          j.guardian_doc_type = pd["person2-doc-type"]
          j.guardian_doc_front = pd["person2-doc-front"]
          j.guardian_doc_back = pd["person2-doc-back"] || ''
          j.guardian_profile_image = pd["person2-image"]
          j.guardian_mobile_no = pd["person2-mobile"]
          j.guardian_is_mobile_verified = pd["person2-mobile-verified"]
          j.guardian_address_line1 = pd["person2-address-ln1"]
          j.guardian_address_line2 = pd["person2-address-ln2"]
          j.guardian_city = pd["person2-city"]
          j.guardian_state = pd["person2-state"]
          j.guardian_country = pd["person2-country"]
          j.guardian_zipcode = pd["person2-zipcode"]

          let isupdated = await j.save();
          return isupdated;
          // console.log("updated successfully:>>>>>>>>>>>>>", isupdated);
        }

      } catch (err) {
        throw new Error(err);
      }
    } else {
      throw new Error("Please provide user id");
    }
  }

  async getGuardianDetails() {
    if (this.personId) {
      try {
        const gp = await PgPerson.findById(this.personId);
        if (gp) {
          this.guardianDetails = {
            "person2-fullname": gp.guardian_fullName,
            "person2-email": gp.guardian_email,
            "person2-gender": gp.guardian_gender,
            "person2-doc-type": gp.guardian_doc_type,
            "person2-doc-front": gp.guardian_doc_front,
            "person2-doc-back": gp.guardian_doc_back,
            "person2-mobile": gp.guardian_mobile_no,
            "person2-mobile-verified": gp.guardian_is_mobile_verified,
            "person2-address-ln1": gp.guardian_address_line1,
            "person2-address-ln2": gp.guardian_address_line2,
            "person2-city": gp.guardian_city,
            "person2-state": gp.guardian_state,
            "person2-country": gp.guardian_country,
            "person2-zipcode": gp.guardian_zipcode,
          }
          return this.guardianDetails;
        }

      } catch (err) {
        throw new Error(err);
      }
    }
  }

  /**
   * Get Payment Info
   */
  async getPaymentInfo() {
    if (this.personId == null) {
      return null;
    }
    let p = await PgPayment.getPaymentByUserId(this.personId);
    let data = [];
    p.length && p.forEach(function (py) {
      data.push({
        "payment-type": py.payment_type,
        "payment-status": py.payment_status,
        "payment-amt": py.payment_amount,
        "payment-currency": py.payment_currency,
        "payment-ref-id": py.transection_id,
        "payment-comment": py.additional_comment
      })
    })
    return data || null;
  }

  /*************************************************
   * Get list of person
   *************************************************/
  async getAllPgPerson() {
    try {
      let alldata = [];
      const gapp = await PgPerson.find().select("_id fullName profile_image city mobile_no guardian_mobile_no created_at").populate("person_payments", "payment_status created_at").populate("person_deposit", "payment_status");
      if (gapp?.length) {
        gapp.forEach(p => {
          alldata.push({
            id: p._id,
            fullName: p.fullName,
            profile_image: p.profile_image,
            city: p.city,
            mobile_no: p.mobile_no,
            guardian_mobile_no: p.guardian_mobile_no,
            created_at: new Date(p.created_at).toLocaleDateString(),
            isDepositPaid: p?.person_deposit?.payment_status == "paid" ? true : false
          })
        });
        return alldata;
      }
      return gapp
    } catch (err) {
      throw new Error(err);
    }
  }

  async makePayment(pd) {
    if (this.personId == null) return null;

    try {
      const paymentData = await this.payment.addNewPayments(pd);
      if (paymentData?.id) {
        const user = await PgPerson.findById(this.personId);
        if (user) {
          if (paymentData.paytype == "rent") {
            user.person_payments.push(paymentData.id);
          }
          if (paymentData.paytype == "deposit") {
            user.person_deposit = paymentData.id
          }
          return user.save();
        }
        return false;
      } else {
        return false;
      }
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = Person;