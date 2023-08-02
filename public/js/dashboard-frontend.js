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


    /**
     * Hide mobile verification Popup
     */
    const popupOverlay = document.querySelector("[data-model-overlay]");
    const popupBox = document.querySelector("[data-model]");
    const closeBtn = document.querySelector("[data-model] .cursor-pointer");
    const submitBtn = document.querySelector("[data-model] [data-verifyfrm-submit]");
    const stateVerify = popupBox.querySelector(`[data-verification-state="pending"]`);
    const stateVerified = popupBox.querySelector(`[data-verification-state="verified"]`);
    const stateError = popupBox.querySelector(`[data-verification-state="error"]`);

    const showLoader = (hide = false) => {
        if (hide) {
            stateVerify && stateVerify.classList.add("hidden");
            return;
        }
        stateVerify && stateVerify.classList.remove("hidden");
    }
    const showVerifed = (hide = false) => {
        if (hide) {
            stateVerified && stateVerified.classList.add("hidden");
            return;
        }
        stateVerified && stateVerified.classList.remove("hidden");
    }

    const showError = (hide = false) => {
        if (hide) {
            stateError && stateError.classList.add("hidden");
            return;

        }
        stateError && stateError.classList.remove("hidden");
    }

    const closePopup = () => {
        popupOverlay && popupOverlay.classList.add("hidden");
        popupBox && popupBox.classList.add("hidden");
    }
    closeBtn && closeBtn.addEventListener("click", () => {
        closePopup();
    });

    /**
     * Send mobile verification request
     */
    document.forms['mobile-verification-frm'].addEventListener("submit", (e) => {
        e.preventDefault()
    })
    submitBtn && submitBtn.addEventListener("click", async (e) => {
        const vcode = popupBox.querySelector(`input[name="mobile-verification"]`);
        const removeErrorNode = () => {
            const errorSpan = popupBox.querySelector("[data-verifrm-error]");
            errorSpan && errorSpan.remove();
            vcode.style.border = "1px solid #e5e7eb";
        }

        const disableSubmit = (isDisabled = true) => {
            submitBtn.setAttribute("disabled", isDisabled);
            submitBtn.style.cursor = isDisabled ? "not-allowed" : "pointer";
        }

        if (vcode?.value?.trim()?.length == 0 || vcode?.value?.trim()?.length < 6) {
            const span = document.createElement("span");
            span.innerHTML = "Please enter valid code";
            span.setAttribute("data-verifrm-error", '');
            span.style.color = "red";

            removeErrorNode();
            vcode.parentNode.insertBefore(span, vcode.nextSibling)
            vcode.style.border = "1px solid red";
            return
        } else {
            removeErrorNode();
            //show loading
            showLoader();
            disableSubmit();

            const url = window.location.origin + "/dashboard/verifycode";
            const option = {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                body: JSON.stringify({
                    vcode: vcode?.value || 0
                })
            }
            const res = await sendRequest(url, option);
            console.log(res)
            if (res.success) {
                const currentPath = window.location.pathname.split("/");
                showLoader(true);
                disableSubmit(false);
                showError(true);
                showVerifed();

                vcode.value = '';
                closePopup();

                // if (currentPath.length && currentPath.includes("personal-info")) {
                //     currentPath.pop("personal-info");
                //     currentPath.push("guardian-info");
                //     window.location.href = currentPath.join("/")
                // } else {
                //     currentPath.length && currentPath.includes("guardian-info");
                //     currentPath.pop("guardian-info");
                //     currentPath.push("payment-info");
                //     window.location.href = currentPath.join("/");
                // }
            } else {
                showLoader(true);
                disableSubmit(false);
                showVerifed(true);
                showError();
            }
        }

    })
}

const customTab = () =>{
    const tabContainer = document.querySelector(`[data-tabs-container]`);
    const tabs = document.querySelector(`[data-tabs-container] [data-tabs]`);
    if(tabs){
        tabs.querySelectorAll("li").forEach(el=>{
            el.addEventListener("click",(e)=>{
                const id = e.target.dataset.tabid;
                const tabDiv = document.querySelector(id);

                const allTabConent = tabContainer.querySelectorAll(`[data-tabcontent]`);
                
                if(allTabConent.length) {
                    allTabConent.forEach(el => {
                        el.classList.add("hidden");
                    });

                    tabs.querySelectorAll("li").forEach(el => {
                        el.classList.add("bg-gray-100","border-b-0");
                        el.classList.remove("bg-white","border-b-[3px]","border-b-purple-700");
                    })
                    tabDiv.classList.remove("hidden");
                    e.target.classList.add("bg-white","border-b-[3px]","border-b-purple-700");
                    e.target.classList.remove("bg-gray-100","border-b-0");
                }
                
            })
        })
    }
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
        "/dashboard/person/edit": () => {
            createPersonScript();
            customTab();
        }
    }

    if (Object.keys(callDict).includes(pathName)) {
        typeof callDict[pathName] == "function" && callDict[pathName].call();
    }else{
        if(Object.keys(callDict).length){
            const checkUrlPattern = (url) => {
                let pattern = `(${url.replaceAll("/","\/")})+`; 
                let tergetPattern = new RegExp(pattern);
                return tergetPattern.test(window.location.pathname);
             }
            let targetUrl = Object.keys(callDict).find(checkUrlPattern);
            if(targetUrl){
                typeof callDict[targetUrl] == "function" && callDict[targetUrl].call();
            }
        }
    }
}


main();