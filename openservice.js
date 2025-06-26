
var currentItemElement = null; // Global variabel for å holde styr på gjeldende service-liste

document.getElementById("fromServicetoCustomer").addEventListener("click", function () {
   
      // Trykk på faneknappen
    const customerTabButton = document.getElementById("customertabbutton");
    if (customerTabButton) customerTabButton.click();

});


function listServiceOnsystem(itemElement, item, customer) {

    //list opp servicer
    const serviceListContainer = itemElement.querySelector(".serviceelementlist");
    serviceListContainer.innerHTML = ''; // Tøm containeren
    
    // Hent mal for serviceelement
    const elementLibrary = document.getElementById("elementlibrary");
    const serviceElementTemplate = elementLibrary.querySelector(".servicerow");

    const servicecalcElement = elementLibrary.querySelector(".servicecalc");

    // Sorter service etter dato
    item.service.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    //sjekk om det allerede finnes en service med "kalkulert" status da må disse fjernes først
    const existingService = item.service.find(s => s.status && s.status.toLowerCase() === "kalkulert");
    if (existingService) {
        //fjern eksisterende kalkulert service
        item.service = item.service.filter(s => s.rawid !== existingService.rawid);
    }

    //Sjekke om den skal foreslåes neste service
    const serviceinfo = findserviceinfo(item);
    if (serviceinfo.suggestedService) {
        const service = serviceinfo.suggestedService;
        //legg til ny kalkulert først i item.service
        item.service.unshift(service);
    }

    if (!item.service || item.service.length === 0) {
        serviceListContainer.textContent = "Ingen service funnet for dette systemet.";
        return;
    }

    item.service.forEach((service) => {

        let serviceElement = makeServiceElement(service, itemElement, item, customer, serviceElementTemplate, servicecalcElement);
        serviceListContainer.appendChild(serviceElement);

    });
}

function makeServiceElement(service, itemElement, item, customer, serviceElementTemplate, servicecalcElement) {

    let serviceElement;

    if(service.status === "Kalkulert" || service.status === "kalkulert") {
        serviceElement = servicecalcElement.cloneNode(true);

            //lage klik event på newservicebutton
        const newServiceButton = serviceElement.querySelector(".newcalcservice");
        if (newServiceButton) {
            //sett bakgrunsfarge på knappen som tilsvarer status "kalkulert"
            const statusObj = statusService.find(status => status.value.toLowerCase() === "kalkulert");
            if (statusObj) {
                newServiceButton.style.backgroundColor = statusObj.color; // Sett bakgrunnsfarge basert på status
            }

            newServiceButton.addEventListener("click", function () {
                makeNewService(itemElement,item, service,serviceElement);
            });
        }

    }else{
        serviceElement = serviceElementTemplate.cloneNode(true);
    }
    //knappen moreinfo
    const openservicebutton = serviceElement.querySelector(".openservicebutton");
    //sett farge på openservicebutton
    if (openservicebutton) {
        const statusObj = statusService.find(status => status.value.toLowerCase() === (service.status || "").toLowerCase());
        if (statusObj) {
            openservicebutton.style.backgroundColor = statusObj.color; // Sett bakgrunnsfarge basert på status
        }
    }
    
    //sette dato
    const dateInput = serviceElement.querySelector(".servicedate");

    if (service.date) {
    const d = new Date(service.date);
    // Formatér til YYYY-MM-DDTHH:mm
    const formatted =
        d.toISOString().slice(0, 16); // "2025-06-01T00:00"
    dateInput.value = formatted;
    } else {
    dateInput.value = "";
    }

    //når dato settes send dette til server
    dateInput.addEventListener("change", function () {
        const newDate = new Date(dateInput.value);
        if (isNaN(newDate)) {
            console.error("Ugyldig dato:", dateInput.value);
            return;
        }
        // Oppdater service med ny dato
        service.date = newDate.toISOString(); // Lagre dato i ISO-format

        //send til server
        let data = {date: newDate.toISOString()};
        sendEditServiceToServer(service, data);
    }
    );
    
    //Load status selectoren med arrayen statusService
    const statusSelect = serviceElement.querySelector(".editstatusservice");
    if (statusSelect) {
        statusSelect.innerHTML = ''; // Tøm select-elementet
        statusService.forEach(status => {
        const option = document.createElement("option");
        option.value = status.value;
        option.textContent = status.text;
        //gjøre begge om til lowercase for å sammenligne
        if (service.status && status.value && service.status.toLowerCase() === status.value.toLowerCase()) {
            option.selected = true; // Marker som valgt hvis det samsvarer med tjenestens status
        }

        //hvis status er fakturert
        if (status.value === "Kalkulert" || status.value === "kalkulert") {
            option.disabled = true; // Deaktiver alternativer
        }
        
        statusSelect.appendChild(option);
        });

        // Legg til endringshendelse for status
        statusSelect.addEventListener("change", function () {
            const selectedStatus = statusSelect.value;
            if (selectedStatus) {
                // Oppdater tjenestens status
                service.status = selectedStatus;
                //send til server
                let data = {status: selectedStatus};
                sendEditServiceToServer(service, data);

                //sett riktig bordercolor på serviceelementet
                const statusObj = statusService.find(status => status.value.toLowerCase() === selectedStatus.toLowerCase());
                const borderColor = statusObj ? statusObj.color : "gray";
                serviceElement.style.borderLeft = `6px solid ${borderColor}`;

                    // Oppdater lastservice datoen
                    const lastServiceLabel = itemElement.querySelector(".lastservicelable");
                    let serviceInfo = findserviceinfo(item);
                    if (lastServiceLabel) {
                        lastServiceLabel.textContent = serviceInfo.lastservice || "–";
                    }
                    // Oppdater neste service datoen
                    const nextServiceLabel = itemElement.querySelector(".nextservicelable");
                    if (nextServiceLabel) {
                        nextServiceLabel.textContent = serviceInfo.nextservice || "–";
                        nextServiceLabel.style.color = serviceInfo.color || "black"; // Sett farge basert på status
                    }

                    //oppdater farge på moreInfo
                    if (openservicebutton) {
                        const statusObj = statusService.find(status => status.value.toLowerCase() === selectedStatus.toLowerCase());
                        if (statusObj) {
                            openservicebutton.style.backgroundColor = statusObj.color; // Sett bakgrunnsfarge basert på status
                        }
                    }
                

            }
        });
    }

    //loade edittypeservice med gServicetype
    const typeSelect = serviceElement.querySelector(".edittypeservice");
    if (typeSelect) {
        typeSelect.innerHTML = ''; // Tøm select-elementet
        gServicetype.forEach(type => {
        const option = document.createElement("option");
        option.value = type.rawid; // Bruk rawid som value
        option.textContent = type.name;
        //gjøre begge om til lowercase for å sammenligne
        if (service.type && type.rawid && service.type.toLowerCase() === type.rawid.toLowerCase()) {
            option.selected = true; // Marker som valgt hvis det samsvarer med tjenestens type
        }
        typeSelect.appendChild(option);
        });

        // Legg til endringshendelse for type
        typeSelect.addEventListener("change", function () {
            const selectedType = typeSelect.value;
            if (selectedType) {
                // Oppdater tjenestens type
                service.type = selectedType;
                //send til server
                let data = {type: [selectedType]};
                sendEditServiceToServer(service, data);
            }
        });
    }

    //loade edituserservice med gUsers
    const userSelect = serviceElement.querySelector(".edituserservice");
    if (userSelect) {
        userSelect.innerHTML = ''; // Tøm select-elementet
        gUsers.forEach(user => {
        const option = document.createElement("option");
        option.value = user.rawid; // Bruk brukerens ID som value
        option.textContent = user.name;
        //gjøre begge om til lowercase for å sammenligne
        if (service.userid === user.rawid) {
            option.selected = true; // Marker som valgt hvis det samsvarer med tjenestens bruker
        }
        userSelect.appendChild(option);
        });

        // Legg til endringshendelse for bruker
        userSelect.addEventListener("change", function () {
            const selectedUser = userSelect.value;
            if (selectedUser) {
                // Oppdater tjenestens bruker
                service.userid = selectedUser;
                //send til server
                let data = {user: [selectedUser]};
                sendEditServiceToServer(service, data);
            }
        }
        );
    } 

    //åpner mer informasjon på service
    const moreInfo = serviceElement.querySelector(".moreserviceinfo");
    if (moreInfo) {
        
        moreInfo.style.height = "0px"; // Start med høyde 0 for animasjon


        
        openservicebutton.addEventListener("click", () => {
        
        if (!moreInfo) return;
        
        const isCollapsed = moreInfo.offsetHeight === 0;
        
        if (isCollapsed) {
            // Åpne: start fra 0 og gå til scrollHeight
            moreInfo.style.height = "0px"; // sikker start
            const fullHeight = moreInfo.scrollHeight + "px";
        
            requestAnimationFrame(() => {
            moreInfo.style.height = fullHeight;
            });
        
            // Etter animasjonen, fjern høyden så den tilpasses innhold automatisk
            setTimeout(() => {
            moreInfo.style.height = "auto";
            }, 400);
        } else {
            // Lukk: start fra nåværende høyde og gå til 0
            const currentHeight = moreInfo.scrollHeight + "px";
            moreInfo.style.height = currentHeight;
        
            requestAnimationFrame(() => {
            moreInfo.style.height = "0px";
            });
        }
        });
    }
    
    
    const noteservicequill = serviceElement.querySelector(".noteservicequill");
    if (noteservicequill) {
        // Initialize Quill editor for notes
        const quill = new Quill(noteservicequill, {
        theme: 'snow',
        modules: {
            toolbar: true // Viktig for at den skal bli generert
        }
        });
        
        // 3. Lim inn eksisterende HTML-basert notat (kan inneholde <br> osv.)
    setTimeout(() => {
        quill.clipboard.dangerouslyPasteHTML(service.note || "");
        }, 0);
        
        // 4. Lytt etter blur (når man forlater editoren)
        quill.root.addEventListener("blur", function () {
        // Hent HTML-innholdet fra Quill-editoren
        let noteContent = quill.root.innerHTML;
        console.log("Note content:", noteContent);
        // Oppdater tjenesten med det nye notatet
        service.note = noteContent;
        // Send oppdateringen til serveren
        let data = {note: noteContent};
        sendEditServiceToServer(service, data);
        });
    }

    // Sett border på høyre side av systemelement basert på siste status
    const statusObj = statusService.find(status => status.value.toLowerCase() === (service.status || "").toLowerCase());
    const borderColor = statusObj ? statusObj.color : "gray";
    serviceElement.style.borderLeft = `6px solid ${borderColor}`;

    //deleteknapp
    const deleteservicebutton = serviceElement.querySelector(".deleteservicebutton");
    if (deleteservicebutton) {
        deleteservicebutton.addEventListener("click", function () {
            // Bekreft sletting
            if (confirm("Er du sikker på at du vil slette denne servicen?")) {
                // slett service fra Airtable og lokal array
                deleteService(service, itemElement, item, customer);
            }
        });
    }



    // Returner det ferdige service-elementet
    return serviceElement;

}

function deleteService(service, itemElement, item, customer){

    let serviceId = service.rawid; 
    DELETEairtable(
        "appuUESr4s93SWaS7",
        "tblPWerScR5AbxnlJ", // system-tabell
        serviceId,
        "responseDeleteService"
    );
    

    //fjern servicen fra systemet
    let system = customer.system.find(s => s.rawid === item.rawid);
    if (system && system.service) {
        system.service = system.service.filter(s => s.rawid !== serviceId);
    }

    // lag listen på nytt
    listServiceOnsystem(itemElement, system, customer);

}

function makeNewService(itemElement, item, service,serviceelement) {

    currentItemElement = itemElement; // Oppdater global variabel

  
    let serviceinfo = findserviceinfo(item);
    let nextServiceDate = (serviceinfo.nextserviceDate instanceof Date && !isNaN(serviceinfo.nextserviceDate))
    ? serviceinfo.nextserviceDate.toISOString()
    : new Date().toISOString();

    //sjekk om service.date er satt, hvis ikke bruk nextServiceDate
    if (service.date) {
        //da er dette fra et kalkulert service element
        nextServiceDate = service.date; // Bruk eksisterende dato hvis den er satt
        //fjern elementet mens den oppretter på server
        serviceelement.remove();
    }


    let userid = gUser.rawid || "";

    let body = {
        system: [item.rawid],
        status: "Registrert",
        user: [userid],
        date: nextServiceDate
    };

    const elementLibrary = document.getElementById("elementlibrary");
    const loaderElement = elementLibrary?.querySelector(".loaderconteiner");
    const serviceelementlist = itemElement.querySelector(".serviceelementlist");

    if (loaderElement && serviceelementlist) {
        const loaderClone = loaderElement.cloneNode(true);
        const textinfo = loaderClone.querySelector(".textinfo");
        if (textinfo) {
            textinfo.textContent = "Oppretter ny service...";
        }
        serviceelementlist.prepend(loaderClone);
    }

    // Send til server
    POSTairtable(
        "appuUESr4s93SWaS7",
        "tblPWerScR5AbxnlJ", // system-tabell
        JSON.stringify(body),
        "responseNewService"
    );
}

function responseNewService(data) {
   
    let newService = JSON.parse(data.fields.json);
    // Legg til det nye systemet i kundens systemliste

    console.log("Ny service opprettet:", newService);
  
    //oppdater kunde 
    let customer = gCustomer.find(c => c.rawid === newService.customerid);
    if (customer) {
        // Finn systemet i kundens systemliste
        let system = customer.system.find(s => s.rawid === newService.systemid);
        if (system) {
            // Legg til den nye servicen i systemets service-liste
            if (!system.service) {
                system.service = [];
            }
            system.service.push(newService);

            // Oppdater visningen av systemet
            listServiceOnsystem(currentItemElement, system, customer);

        }
    }
    
    
}

function responseDeleteService(data) {
console.log("Service slettet:", data);

}

function sendEditServiceToServer(service, data) {
    let body = JSON.stringify(data);
    let rawid = service.rawid;
    PATCHairtable("appuUESr4s93SWaS7", "tblPWerScR5AbxnlJ", rawid, body, "responseEditService");
}

function responseEditService(data) {
    //oppdater gService med den oppdaterte servicen
    const updatedService = JSON.parse(data.fields.json);
  console.log("Service oppdatert:", updatedService);

}