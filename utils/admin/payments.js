const PgPayment = require("../../models/admin/PgPayment");

class Payments {
  constructor(userid = null) {
    this.userid = userid;
  }

  async isUserPayDeposit() {
    if (this.userid) {
      const data = await PgPayment.find({ person_id: this.userid });
      console.log(data);
    } else {
      const err = new Error("User Not Found");
      err.statusCode = 404;
      throw err;
    }
  }

  async addNewPayments(payData) {
    if (this.userid) {
      let isRent = payData["payment-for"] == "rent" ? true : false;
      let isDeposit = payData["payment-for"] == "deposit" ? true : false;
      const paymnt = new PgPayment({
        person_id: this.userid,
        payment_type: payData["payment-type"],
        payment_status: payData["payment-status"],
        payment_amount: payData["payment-amt"],
        payment_currency: payData["payment-currency"],
        transection_id: payData["payment-ref-id"],
        is_rent: isRent,
        is_deposit: isDeposit,
        additional_comment: payData["payment-comment"],
      });
      let p = await paymnt.save();
      if (p) {
        return {
          id: p._id,
          paytype: payData["payment-for"]
        }
      }
    } else {
      const err = new Error("User Not Found");
      err.statusCode = 404;
      throw err;
    }
  }

  async getPaymentTags() {
    //get all payment of this person
    if (this.userid) {
      const allPayments = await PgPayment.find({ person_id: this.userid });
      if (allPayments.length) {
        const tags = [];
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        allPayments.forEach(pymt => {
          const thatday = new Date(pymt.created_at);
          tags.push({
            amount: pymt.payment_amount,
            currency: pymt.payment_currency,
            status: pymt.payment_status,
            is_rent: pymt.is_rent,
            is_deposit: pymt.is_deposit,
            month: monthNames[thatday.getMonth()],
            year: thatday.getFullYear()
          })
        });
        return tags;
      }

      return false;
    }else{
      return false;
    }
  }
}

module.exports = Payments;