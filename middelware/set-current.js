const Person = require("../utils/admin/person");

module.exports  = async (req, res, next) => {
  const uid = req.query?.uid;
  if (!uid) {
    return res.redirect("/dashboard/person");
  }
  req.session.uid = uid;

  const person = new Person(uid);
  const personal = await person.getPersonalDetails();
  const gaurdian = await person.getGuardianDetails();
  req.session.userInfo = Object.assign({}, personal, gaurdian);
  next();
}