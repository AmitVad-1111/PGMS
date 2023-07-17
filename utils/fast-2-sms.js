var axios = require("axios");
const sendSMS = async () => {
  const res = await axios.post("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      "authorization": `Bearer L6WXPpCi1IDeG4xKnY8VEdhHFTJzU9vcOoumkl2tMrBgZAwSybqdI3OmAUX5PvzJEFCY4gnRQ89DGflh`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "route": "otp",
      "variables_values": "559933",
      "numbers": "9638867609",
    })
  })
  console.log("fast2sms response: ", res);
}

module.exports = sendSMS;