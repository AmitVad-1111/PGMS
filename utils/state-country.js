const fs = require("fs");
const path = require("path");

const getAllCountry = {};
const getAllStates = {};
getCoutry();
function getCoutry(){
  try{
    const c = fs.readFileSync( path.join(__dirname,"../","/public/data/state-country.json") ,"utf-8");
    const countryArr = JSON.parse(c);
    if(countryArr.countries.length){
      countryArr.countries.forEach(({country,states},i) => {
        getAllCountry[country] = country;
        getAllStates[country] = states;
      });
    }
  }catch(err){
    if(!err.statuCode){
      err.statuCode = 500;
      throw new Error(err);
    }
  }

}

module.exports = {getAllCountry,getAllStates};