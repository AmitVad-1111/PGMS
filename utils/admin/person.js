const PgPerson = require("../../models/admin/PgPerson");

function formatDate(date) {
  let m = date.getMonth() + 1;
  let d = date.getDate();
  return `${date.getFullYear()}-${m > 9 ? m : '0' + m}-${d > 9 ? d : '0' + d}`;
}


class Person {
  constructor(personid = null) {
    this.personId = personid;
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
      const j = await PgPerson.findOne({ mobile_no: pd["person-mobile"] });
      if (!j) {
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
        if(j){
          this.personId = j._id;
          this.editPersonalDetails(this.personId,pd);
        }
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
  async editPersonalDetails(id, pd) {
    if (id) {
      try {
        const j = await PgPerson.findById(id);
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
          console.log("updated successfully:>>>>>>>>>>>>>",isupdated);
        }

      } catch (err) {
        throw new Error(err);
      }
    } else {
      throw new Error("Please provide user id");
    }
  }
}

module.exports = Person;