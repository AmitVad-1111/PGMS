const fs = require("fs");
const path = require("path");

const getAllCountry = {};
const getAllStates = {};
const getAllDialCode = {};

getCoutry();

function getCoutry() {
  try {
    const c = fs.readFileSync(path.join(__dirname, "../", "/public/data/state-country.json"), "utf-8");
    const dc = fs.readFileSync(path.join(__dirname, "../", "/public/data/country-dail-code.json"), "utf-8");
    const countryArr = JSON.parse(c);
    const dailCode = JSON.parse(dc);

    if (countryArr.countries.length) {
      countryArr.countries.forEach(({ country, states }, i) => {
        getAllCountry[country] = country;
        getAllStates[country] = states;
      });
    }

    if (dailCode.length) {
      dailCode.forEach(cd => {
        getAllDialCode[cd.name] = cd.dial_code;
      })
    }
  } catch (err) {
    if (!err.statuCode) {
      err.statuCode = 500;
      throw new Error(err);
    }
  }

}

module.exports = { getAllCountry, getAllStates, getAllDialCode };