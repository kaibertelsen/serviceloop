
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
    

    if (!item.service || item.service.length === 0) {
    serviceListContainer.textContent = "Ingen service funnet for dette systemet.";
    return;
    }
    // Hent mal for serviceelement
    const elementLibrary = document.getElementById("elementlibrary");
    const serviceElementTemplate = elementLibrary.querySelector(".servicerow");
    if (!serviceElementTemplate) {
    console.error("Ingen '.serviceelement' funnet i 'elementlibrary'.");
    return;
    }
    // Sorter service etter dato
    item.service.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));


    

    item.service.forEach((service) => {

        const serviceElement = serviceElementTemplate.cloneNode(true);

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
            if (status.value === "fakturert" || status.value === "Fakturert") {
              option.disabled = true; // Deaktiver alternativet hvis status er fakturert
            }
            
            statusSelect.appendChild(option);
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
        } 

        //åpner mer informasjon på service
        const moreInfo = serviceElement.querySelector(".moreserviceinfo");
        moreInfo.style.height = "0px"; // Start med høyde 0 for animasjon
        serviceElement.querySelector(".openservicebutton").addEventListener("click", () => {
            
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
            //send til server
            let data = {note: noteContent};
            //sendEditSystemToServer(item, data);
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
                    // Send slett forespørsel til server
                    let serviceId = service.rawid; // Anta at rawid er ID-en for servicen
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

                    // Fjern service-elementet fra visningen
                    serviceElement.remove();
                    
                }
            });
        }

        serviceListContainer.appendChild(serviceElement);
    });
}


function makeNewService(itemElement, item, customer) {

    currentItemElement = itemElement; // Oppdater global variabel

    let serviceinfo = findserviceinfo(item);
    let nextServiceDate = serviceinfo.nextservice || new Date().toISOString();

    let userid = gUser.rawid || "";

    let body = {
        system: [item.rawid],
        status: "Registrert",
        user: [userid]
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