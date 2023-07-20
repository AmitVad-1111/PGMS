const accountSid = process.env.TWILLIO_SMS_ACC_SID;
const authToken = process.env.TWILLIO_SMS_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendSMS = async () => {

  console.log("Twillio Requres Send");

  const serviceSid = process.env.TWILLIO_SMS_SERVICE_SID;

  client.verify.v2.services(serviceSid)
    .verifications
    .create({ to: '', channel: 'whatsapp' })
    .then(verification => console.log("Twillio Response", verification));

}

module.exports = sendSMS;