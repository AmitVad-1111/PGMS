var axios = require("axios");
const sendSMS = async () => {
  const res = await axios.post("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${process.env.FAST_2_SMS_API}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "route": "otp",
      "variables_values": "559933",
      "numbers": "12345685469",
    })
  })
  console.log("fast2sms response: ", res);
}

module.exports = sendSMS;