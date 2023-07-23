const accountSid = process.env.TWILLIO_SMS_ACC_SID;
const authToken = process.env.TWILLIO_SMS_AUTH_TOKEN;
const serviceSid = process.env.TWILLIO_SMS_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);

const sendSMS = async (mobile) => {

  console.log("Twillio Requres Send", mobile);

  return await client.verify.v2.services(serviceSid)
    .verifications
    .create({ to: mobile, channel: 'sms' })
    .then(verification =>{return verification});

}

const verifyCode = async (mobile,vcode) =>{
  console.log(mobile);
  console.log(vcode);
  return await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({to: mobile, code: `${vcode}`})
      .then(verification_check =>{return verification_check.status});
}

module.exports = {sendSMS,verifyCode};