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
                if (e.target.value.trim() == "aadhar" || e.target.value.trim() == "vi") {
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

function callRemoveCta(msg) {
    const removeBtn = document.querySelectorAll("[data-remove]");
    removeBtn.length && removeBtn.forEach(rbtn => {
        rbtn.addEventListener("click", (e) => {
            console.log(e.target.parentNode);
            Swal.fire({
                title: msg,
                icon: "question",
                showCancelButton: true,
                confirmButtonText: 'Yes',
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    const submitEvent = new CustomEvent("submit", { cancelable: true });
                    e.target.parentNode.requestSubmit();
                }
            });
        })
    })


}


const PopupObject = {
    popupOverlay: document.querySelector("[data-model-overlay]"),
    popupBox: document.querySelector("[data-model]"),
    popupContent: document.querySelector("[data-model] [data-content]"),
    closeBtn: document.querySelector("[data-model] .cursor-pointer"),
    loader: document.querySelector("[data-model] [data-loader]"),
    openPopup: function () {
        this.popupOverlay && this.popupOverlay.classList.remove("hidden");
        this.popupBox && this.popupBox.classList.remove("hidden");
    },
    showLoader: function (hide = false) {
        if (hide) {
            this.loader && this.loader.classList.add("hidden");
            return;
        }
        this.loader && this.loader.classList.remove("hidden");
    },
    showConent: function () {
        this.popupContent && this.popupContent.classList.remove("hidden");
    },
    hideConent: function () {
        this.popupContent && this.popupContent.classList.add("hidden");
    },
    closePopup: function () {
        this.popupOverlay && this.popupOverlay.classList.add("hidden");
        this.popupBox && this.popupBox.classList.add("hidden");
    },
    bindCloseEvent: function () {
        const closePopupFn = this.closePopup.bind(this);
        this.closeBtn && this.closeBtn.addEventListener("click", function () {
            closePopupFn();
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
        const mode = popupBox.querySelector(`input[name="mode"]`);
        const removeErrorNode = () => {
            const errorSpan = popupBox.querySelector("[data-verifrm-error]");
            errorSpan && errorSpan.remove();
            vcode.style.border = "1px solid #e5e7eb";
        }

        const disableSubmit = (isDisabled = false) => {
            if (isDisabled) {
                submitBtn.setAttribute("disabled", isDisabled);
            } else {
                submitBtn.removeAttribute("disabled");
            }
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
            disableSubmit(true);

            const url = window.location.origin + "/dashboard/verifycode";
            const option = {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "accept": "application/json"
                },
                body: JSON.stringify({
                    vcode: vcode?.value || 0,
                    mode: mode ? mode.value : "create"
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


                if (mode && mode.value == "edit") {
                    const field = document.querySelector("#person-mobile");
                    const field2 = document.querySelector("#person2-mobile");

                    if (field.classList.contains("border-red-700")) {
                        field.classList.remove("border-red-700");
                        field.nextElementSibling.innerHTML = "";
                    }

                    if (field2.classList.contains("border-red-700")) {
                        field2.classList.remove("border-red-700");
                        field2.nextElementSibling.innerHTML = "";
                    }
                }


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

const customTab = () => {
    const tabContainer = document.querySelector(`[data-tabs-container]`);
    const tabs = document.querySelector(`[data-tabs-container] [data-tabs]`);
    if (tabs) {
        tabs.querySelectorAll("li").forEach(el => {
            el.addEventListener("click", (e) => {
                const id = e.target.dataset.tabid;
                const tabDiv = document.querySelector(id);

                const allTabConent = tabContainer.querySelectorAll(`[data-tabcontent]`);

                if (allTabConent.length) {
                    allTabConent.forEach(el => {
                        el.classList.add("hidden");
                    });

                    tabs.querySelectorAll("li").forEach(el => {
                        el.classList.add("bg-gray-100", "border-b-0");
                        el.classList.remove("bg-white", "border-b-[3px]", "border-b-purple-700");
                    })
                    tabDiv.classList.remove("hidden");
                    e.target.classList.add("bg-white", "border-b-[3px]", "border-b-purple-700");
                    e.target.classList.remove("bg-gray-100", "border-b-0");
                }

            })
        })
    }
}

const openInfoPopup = (elment) => {
    if (elment.length) {
        elment.forEach(el => {
            el.addEventListener("click", async function (e) {
                let id = event.currentTarget.parentNode.querySelector(`[name="room_id"]`)?.value || 0;

                if (!id) {
                    Swal.fire({
                        title: "Room Not Found",
                        icon: "error",
                    })
                }

                //open popup
                PopupObject.openPopup();
                PopupObject.showLoader();

                const url = window.location.origin + "/dashboard/getroom";
                const option = {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "accept": "application/json"
                    },
                    body: JSON.stringify({
                        roomId: id || 0
                    })
                };
                const res = await sendRequest(url, option);
                if (res.success) {
                    console.log(res);
                    const roomD = res.data;
                    PopupObject.showLoader(true);

                    const avail_status = PopupObject.popupContent.querySelector(".avaibility");
                    const full_status = PopupObject.popupContent.querySelector(".rfull");

                    const profile = PopupObject.popupContent.querySelector(".room-image");
                    const roomNo = PopupObject.popupContent.querySelector(".roomNo");
                    const location = PopupObject.popupContent.querySelector(".location");
                    const numSharing = PopupObject.popupContent.querySelector(".num_sharing");

                    //check for availability
                    const roomMates = PopupObject.popupContent.querySelector(".room_mates");
                    if (roomD.room_mates.length > 0) {
                        if (roomD.room_mates.length < roomD.num_sharing) {
                            avail_status.classList.remove("hidden")
                            full_status.classList.add("hidden")
                        } else {
                            avail_status.classList.add("hidden")
                            full_status.classList.remove("hidden")
                        }

                        
                        let h = '';
                        roomD.room_mates.forEach(pd => {
                            h += `
                                <div class="flex pr-3 pb-1">
                                    <div>
                                        <img  src="/images/uploads${pd.profile}" alt="${pd.name}" class="w-[100px] h-[100px] border-2">
                                    </div>  
                                    <div class="pl-1">
                                        <div class="font-semibold text-sm">${pd.name}</div>
                                        <div class="font-semibold text-sm">${pd.mobile_no}</div>
                                    </div>
                                </div>
                            `
                        });

                       if(roomMates){
                        roomMates.innerHTML = h;
                        roomMates.parentNode.style.display = "block";
                       } 

                    } else {
                        avail_status.classList.remove("hidden");
                        full_status.classList.add("hidden");
                        if(roomMates){
                            roomMates.innerHTML = '';
                            roomMates.parentNode.style.display = "none";
                        } 
                    }

                    profile.setAttribute("src", `/images/uploads${roomD.room_image}`)
                    profile.setAttribute("alt", roomD.room_no);

                    roomNo.innerHTML = roomD.room_no;
                    location.innerHTML = roomD.room_location;
                    numSharing.innerHTML = roomD.num_sharing;

                    // roomD.room_facility.length && roomD.room_facility.forEach(f => {
                    //     const fc = PopupObject.popupContent.querySelector(`[data-${f.replaceAll(" ","-")}]`);
                    //     fc && fc.classList.add("processed");

                    // })
                    // const not_processed = PopupObject.popupContent.querySelectorAll(`.facility:not(.processed)`); 
                    // not_processed.length && no

                    PopupObject.showConent();

                } else {
                    PopupObject.showLoader(true);
                    PopupObject.hideConent();
                }
            });

        });

        //bind popup close event
        PopupObject.bindCloseEvent();
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
        },
        "/dashboard/person": () => {
            callRemoveCta('Do you want to delete this person?');
        },
        "/dashboard/rooms": () => {
            callRemoveCta('Do you want to delete this room?');
            openInfoPopup(document.querySelectorAll("[data-infoPopup]"));
        },

    }

    if (Object.keys(callDict).includes(pathName)) {
        typeof callDict[pathName] == "function" && callDict[pathName].call();
    } else {
        if (Object.keys(callDict).length) {
            const checkUrlPattern = (url) => {
                let pattern = `(${url.replaceAll("/", "\/")})+`;
                let tergetPattern = new RegExp(pattern);
                return tergetPattern.test(window.location.pathname);
            }
            let targetUrl = Object.keys(callDict).find(checkUrlPattern);
            if (targetUrl) {
                typeof callDict[targetUrl] == "function" && callDict[targetUrl].call();
            }
        }
    }

    window.addEventListener("onunload", function () {
        sendRequest("/dashboard/session/destroy", {
            method: "GET",
        });
    });

}


main();