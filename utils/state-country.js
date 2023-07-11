const fs = require("fs");
const path = require("path");

const getAllCountry = {};
getCoutry();
function getCoutry() {
  try{
    const c = fs.readFileSync( path.join(__dirname,"../","/public/data/state-country.json") ,"utf-8");
    const countryArr = JSON.parse(c);
    if(countryArr.countries.length){
      countryArr.countries.forEach(({country},i) => {
        getAllCountry[country] = country;
      });
    }
  }catch(err){
    if(!err.statuCode){
      err.statuCode = 500;
      throw new Error(err);
    }
  }

}
console.log(getAllCountry)
module.exports = getAllCountry;