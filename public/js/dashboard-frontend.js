/************************************************************
 * PGMS Frontend Js
 ************************************************************
 * version : 1.0
 * Author  : Amit Vadgama
 ************************************************************
 */

const sendRequest = async (url, option) => {
    if (typeof url == "string" && url.length && Object.keys(option).length) {
        try {
            return fetch(url, option).then(res => res.json()).then(data => { return data }).catch(err => { throw err })
        } catch (err) {
            console.log(err);
        }
    }
}

const checkForDocument = (docType, otherBtn) => {
    if (docType.length) {
        docType.forEach(rd => {
            rd.addEventListener("click", (e) => {
                if (e.target.value.trim() == "aadhar") {
                    otherBtn.parentNode.classList.remove("hidden");
                } else {
                    otherBtn.parentNode.classList.add("hidden");
                }
            })
        })
    }
}

const fillState = (countryEL, stateEL) => {
    if (countryEL) {
        countryEL.addEventListener("change", async (e) => {
            const country = e.target.value;
            const url = window.location.origin + "/dashboard/states";
            const option = {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                body: JSON.stringify({
                    country
                })
            }

            const states = await sendRequest(url, option);
            if (states.success) {
                stateEL.innerHTML = '<option value="">Choose State</option>';
                stateEL && states.data.length && states.data.sort().forEach(s => {
                    let option = document.createElement('option');
                    option.value = s;
                    option.innerHTML = s;
                    stateEL.append(option);
                });
            }
        })
    }
}


const createPersonScript = () => {
    const countryEL = document.querySelector("#person-country");
    const stateEL = document.querySelector("#person-state");

    const countryEL2 = document.querySelector("#person2-country");
    const stateEL2 = document.querySelector("#person2-state");

    fillState(countryEL, stateEL);
    fillState(countryEL2, stateEL2);

    /**
     * if selected document have to side to upload then show other upload field
     */
    const selectedDocType = document.querySelectorAll(`input[name="person-doc-type"]`);
    const backSide = document.querySelector(`input[name="person-doc-back"]`);
    checkForDocument(selectedDocType, backSide);

    const selectedDocType2 = document.querySelectorAll(`input[name="person2-doc-type"]`);
    const backSide2 = document.querySelector(`input[name="person2-doc-back"]`);
    checkForDocument(selectedDocType2, backSide2);
}

function main() {
    const pathName = window.location.pathname;
    const callDict = {
        "/dashboard/person/create-new/personal-info": () => {
            createPersonScript();
        },
        "/dashboard/person/create-new/guardian-info": () => {
            createPersonScript();
        },
    }

    if (Object.keys(callDict).includes(pathName)) {
        typeof callDict[pathName] == "function" && typeof callDict[pathName].call();
    }
}


main();