

async function getCoutry() {
    return await fetch('/data/state-country.json')
        .then((response) => response.json())
        .then((json) => {return json});
}


async function getAllCountry() {
    const country = await getCoutry();
    

    console.log(country);
}


function main() {
    const pathName = window.location.pathname;
    const callDict = {
        "/dashboard/person/create-new" : getAllCountry,
    }

    if(Object.keys(callDict).includes(pathName)){
        typeof callDict[pathName] == "function" && typeof callDict[pathName]();
    }
}


// main();