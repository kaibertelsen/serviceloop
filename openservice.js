
var currentItemElement = null; // Global variabel for å holde styr på gjeldende service-liste
var currentServiceElement = null; // Global variabel for å holde styr på gjeldende service-element
var updateServiceInCalendar = false; // Global variabel for å indikere om vi må oppdatere kalenderen

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
    let isdummy = false; // Variabel for å sjekke om det er en dummy service

    if(service.status === "Kalkulert" || service.status === "kalkulert") {
        isdummy = true; // Marker som dummy service
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

                const warncustomerswitch = serviceElement.querySelector(".warncustomerswitch");
                const warnCustomer = warncustomerswitch && warncustomerswitch.checked;

                
                //gi en alert om at kunde vil bli varslet og trykker man ok så sendes service til server
                if (warnCustomer && !confirm("Kunden vil bli varslet om denne servicen. Er du sikker på at du vil opprette denne servicen?")) {
                    return; // Avbryt hvis brukeren ikke bekrefter
                }
                    
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
        dateInput.value = toLocalInputString(d);
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
        if(!isdummy) {
            //send til server
            let data = {date: newDate.toISOString()};
            sendEditServiceToServer(service, data);
        }
    });
    
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

    //knapp for å påminne på nytt
    const sendnewfollowupbutton = serviceElement.querySelector(".sendnewfollowupbutton");
    if (sendnewfollowupbutton) {
        sendnewfollowupbutton.addEventListener("click", function () {
            // Bekreft sending av ny oppfølging
            if (confirm("Er du sikker på at du vil sende en ny oppfølging for denne servicen?")) {
                // Lag en ny followup
                currentServiceElement = serviceElement; // Oppdater global variabel
                sendwarningToCustomer(item, service);
            }
        });
    }

    

    

    listFollowupOnService(serviceElement, service);

    // Returner det ferdige service-elementet
    return serviceElement;

}

function listFollowupOnService(serviceElement, service) {

    //list opp followingup 
    let listFollowup = serviceElement.querySelector(".followuplistonservice");

    if (!listFollowup) {
        return; // Avbryt hvis listen ikke finnes
    }

    listFollowup.innerHTML = ''; // Tøm listen
    // Hent mal for followup-element
    let nodeElement = document.getElementById("elementlibrary").querySelector(".followupraeelement");

    //sorter service.followup etter dato
    service.followup.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    service.followup.forEach(followup => {
        
        let followupElement = nodeElement.cloneNode(true);
        // Formatert dato og klokkeslett
        const formattedDateTime = formatDateAndTime(followup.date);
        followupElement.querySelector(".followupdasteonservice").textContent = formattedDateTime
        followupElement.querySelector(".emailfollowuplable").textContent = followup.email || "–";

        listFollowup.appendChild(followupElement);
        
    });

}

function deleteService(service, itemElement, item, customer){

    //må hentes fra airtable for å kunne få med oppdatert informajson f.eks eventid
    GETairtable(
        "appuUESr4s93SWaS7",
        "tblPWerScR5AbxnlJ", // system-tabell
        service.rawid,
        "responseGetServiceForDelete"
    );

    let serviceId = service.rawid; 
    //fjern servicen fra systemet
    let system = customer.system.find(s => s.rawid === item.rawid);
    if (system && system.service) {
        system.service = system.service.filter(s => s.rawid !== serviceId);
    }

    
    // lag listen på nytt
    listServiceOnsystem(itemElement, system, customer);

}

function responseGetServiceForDelete(data) {

    let service = JSON.parse(data.fields.json);

    //selt fra kalenderen
    let calendarEvent = creatCalendarEventObject(service);
    calendarEvent.delete = true; // Marker for sletting

    // Send kalenderhendelsen til Zapier for sletting
    sendCalendarEventToZapier(calendarEvent);

    let serviceId = service.rawid; // Forvent at service er en array med minst ett element
    DELETEairtable(
        "appuUESr4s93SWaS7",
        "tblPWerScR5AbxnlJ", // system-tabell
        serviceId,
        "responseDeleteService"
    );


}

function makeNewService(itemElement, item, service,serviceelement) {

    currentServiceElement = itemElement; // Oppdater global variabel

  
    let serviceinfo = findserviceinfo(item);
    let nextServiceDate = (serviceinfo.nextserviceDate instanceof Date && !isNaN(serviceinfo.nextserviceDate))
    ? serviceinfo.nextserviceDate.toISOString()
    : new Date().toISOString();

   
    
    let startDate = service.date || nextServiceDate;
    
    let warnCustomer = false;
    //fjern elementet mens den oppretter på server
    if (serviceelement){
        serviceelement.remove();

         //skal kunden varsles om denne servicen?
        const warncustomerswitch = serviceelement.querySelector(".warncustomerswitch");
        
        if (warncustomerswitch) {
            warnCustomer = warncustomerswitch.checked;
        }

    }


    let status = "Registrert"; // Standard status for ny service
    //hvis kunden skal varsles, sett status til "Påminnet"
    if (warnCustomer) {
        status = "Påminnet";
    }

    let userid = gUser.rawid || "";

    let body = {
        system: [item.rawid],
        status: status,
        user: [userid],
        date: startDate
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

    currentFollowingUp = null; // Nullstill global variabel
    
    if (warnCustomer) {
        // Send varsel til kunden
        currentFollowingUp = true; // Sett global variabel for å indikere at vi følger opp
    sendwarningToCustomer(item, service);

    }

    
}

function responseNewService(data) {
   
    let newService = JSON.parse(data.fields.json);
    // Legg til det nye systemet i kundens systemliste

    console.log("Ny service opprettet:", newService);
  
    //oppdater kunde 
    let customer = gCustomer.find(c => c.rawid === newService.customerid);
    let system = null;
    if (customer) {
        // Finn systemet i kundens systemliste
        system = customer.system.find(s => s.rawid === newService.systemid);
        if (system) {
            // Legg til den nye servicen i systemets service-liste
            if (!system.service) {
                system.service = [];
            }
            system.service.push(newService);

            // Oppdater visningen av systemet
            listServiceOnsystem(currentServiceElement, system, customer);

        }
    }

   
    // Lag kalenderhendelse for den nye servicen
    const calendarEvent = creatCalendarEventObject(newService);
    sendCalendarEventToZapier(calendarEvent);


    //sjekk om den skal lagre en followup
    if (currentFollowingUp) {
        let body = currentFollowingUp;
        body.service = [newService.rawid]; // Legg til service ID i followup-dataen

        //send til airtable
        POSTairtable(
            "appuUESr4s93SWaS7",
            "tblSm8gaXkWw7PFJ8", // followup-tabell
            JSON.stringify(body),
            "responseFollowUp"
        );
        currentFollowingUp = null; // Nullstill global variabel etter sending
    }


    
    
}

function responseFollowUp(data) {
    //oppdater gFollowUp med den oppdaterte followupen
    const followUp = JSON.parse(data.fields.json);
    console.log("Follow-up opprettet:", followUp);

    //oppdatere service med den nye follow-up
    let serviceId = followUp.serviceid // Forvent at service er en array med minst ett element

    //finne denne servicen på currentcustomer (ligger ikke i gService)
    let systems = currentCustomer.system || [];

    systems.forEach(system => {
        if (system.service) {
            let service = system.service.find(s => s.rawid === serviceId);
            if (service) {
                // Legg til follow-up i servicen
                if (!service.followup) {
                    service.followup = [];
                }
                service.followup.push(followUp);

                // Oppdater visningen av followup
                listFollowupOnService(currentServiceElement, service);
            }
        }
    }
    );
    
}

function responseDeleteService(data) {
console.log("Service slettet:", data);

}

function sendEditServiceToServer(service, data) {
    let body = JSON.stringify(data);
    let rawid = service.rawid;
    PATCHairtable("appuUESr4s93SWaS7", "tblPWerScR5AbxnlJ", rawid, body, "responseEditService");


    //hvis det er date eller status som er endret, så må vi oppdatere kalenderhendelsen
    if (data.date || data.status) {
       //denne må også oppdateres i kalenderen etter respons fra airtable
       updateServiceInCalendar = true; // Sett en global variabel for å indikere at vi må oppdatere kalenderen
    }
}

function creatCalendarEventObject(service) {
    const statusKey = (service.status || "").toLowerCase();
    const statusObj = statusService.find(s => s.value === statusKey);
    const eventColor = statusObj?.color || "#CCCCCC";
    const colorId = statusObj?.colorId || "8"; // Standard farge-ID hvis ikke funnet
  
    const customerName = gCustomer.find(c => c.rawid === service.customerid)?.name || "Ukjent kunde";
    const systemName = service.systemname || "Anlegg";
  
    const description = `
    <b>👤 Kunde:</b> ${customerName}<br>
    <b>📦 Status:</b> ${service.status || "Ukjent status"}<br>
    <b>🏠 Plassering:</b> ${service.location || "Ingen plassering oppgitt"}<br>
    <b>🏗️ Anlegg:</b> ${systemName}<br>
    <b>👷 Utføres av:</b> ${service.performed_by || "Ukjent bruker"}<br><br>
    [Serviceid: ${service.rawid}]
    `;
    
  
    const startDate = new Date(service.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
    const reminderMinutesBefore = 2880;
  
    const address = service.address || currentCustomer.address || "";
    const postalCode = service.postcode || currentCustomer.postcode || "";
    const city = service.city || currentCustomer.city || "";

    const fulladress = [address, postalCode, city].filter(part => part).join(", ");
  
    const calendarid = gClient.calendarid || service.calendarid;
    const calendereventid = service.calendareventid || "";

    let returnObject = {
        title: `${customerName} anlegg: ${systemName}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        description: description,
        color: eventColor,
        colorId: colorId,
        serviceId: service.rawid,
        reminderMinutesBefore: reminderMinutesBefore,
        location: location,
        fullAddress: fulladress,
        calendarid: calendarid
    };

   
    // Hvis kalenderhendelses-ID er tilgjengelig, legg den til i objektet
    if (calendereventid) {
        //da blir det en update
        returnObject.calendereventid = calendereventid;
    }

  
    return returnObject;
}
  
function responseEditService(data) {
    //oppdater gService med den oppdaterte servicen
    const updatedService = JSON.parse(data.fields.json);
  console.log("Service oppdatert:", updatedService);

  if (updateServiceInCalendar) {
    // Oppdater kalenderhendelsen
    const calendarEvent = creatCalendarEventObject(updatedService);
    sendCalendarEventToZapier(calendarEvent);
    updateServiceInCalendar = false; // Nullstill etter oppdatering
  }

}

function sendwarningToCustomer(item, service){


    //finne kundenavn
    const customer = gCustomer.find(c => c.rawid === item.customer);
    if (!customer) {
        console.error("Kunde ikke funnet for system:", item.rawid);
        return;
    }

    let navn = customer.name || "Kunde";
    //hvis det er en bedrift fjern navnet
    if (customer.type && customer.type.toLowerCase() === "bedrift") {
        navn = "";
    }


    let anleggsnavn = item.name || "Anlegg";
    const location = item.location || "";
    if (location) {
        anleggsnavn += `(${location})`;
    }

    const servicedato = service.date ? new Date(service.date).toLocaleDateString("no-NO") : "";
    const brukernavn = gUser.name || "Bruker";
    const email = customer.email || "";


    if (!email) {
        console.error("Ingen e-postadresse funnet for kunde:", customer.rawid);
        return;
    }
    // Send e-post via Zapier
    sendServiceReminderToZapier({
        navn: navn,
        anleggsnavn: anleggsnavn,
        servicedato: servicedato,
        brukernavn: brukernavn,
        email: email,
        service: service
    });

   

}

function sendServiceReminderToZapier({ navn, anleggsnavn, servicedato, brukernavn, email, service }) {
    const subject = `Servicepåminnelse for ${anleggsnavn}`;
  
    const htmlBody = `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;padding:30px;background:#fff;border-radius:8px;box-shadow:0 3px 12px rgba(0,0,0,0.05)">
        
        <div style="text-align:center; margin-bottom:30px;">
          <img src="https://cdn.prod.website-files.com/6847e4300d2206b0ffac86d1/68495ac7e72d8c41ea1e06a3_Corsoft-web-textAsset%202.svg" 
               alt="Varme VVS AS logo" 
               style="max-height:60px; max-width:220px;" />
        </div>
  
        <p style="font-size:18px;">Hei ${navn},</p>
  
        <p style="font-size:16px;line-height:1.6">
          Vi ønsker å informere deg om at det nærmer seg service på ditt anlegg: 
          <strong style="color:#004080">${anleggsnavn}</strong>.
        </p>
        <p style="font-size:16px;line-height:1.6">
          Vi foreslår at servicen utføres den <strong style="color:#004080">${servicedato}</strong>.
        </p>
        <p style="font-size:16px;line-height:1.6">
          Regelmessig service sikrer effektiv drift og lengre levetid. Gi oss gjerne en tilbakemelding så vi kan bekrefte tidspunktet eller avtale en annen dag som passer deg bedre.
        </p>
        <p style="font-size:16px;line-height:1.6">
          Du kan svare direkte på denne e-posten dersom du ønsker å avtale noe spesielt.
        </p>
  
        <p style="margin-top:30px;">
          Med vennlig hilsen,<br />
          <strong>${brukernavn}</strong><br />
          Varme VVS AS
        </p>
  
        <p style="color:#777;font-size:13px;margin-top:20px">
          Denne e-posten er sendt automatisk fra vårt system. Ta kontakt dersom noe er uklart.
        </p>
      </div>
    `;
  
    // Lag Zapier-payload
    const payload = {
      to: email,
      subject: subject,
      html: htmlBody
    };
  
    // Send til Zapier webhook
    sendDataToZapierWebhookCreatUser(payload);

    //lagre airtableobject til seinere. Må motta serviceid først content,date,email,user, service 
    let airtableData = { 
        content: htmlBody,
        email: email,
        user: [gUser.rawid]
    };

    if (service && service.rawid) {
        //har den rawid så kan denne lagres med en gang på servicen
        currentFollowingUp = null; // Nullstill global variabel for å indikere at vi ikke følger opp
        airtableData.service = [service.rawid]; // Legg til service ID i followup-dataen
        //send til airtable
        POSTairtable(
            "appuUESr4s93SWaS7",
            "tblSm8gaXkWw7PFJ8", // followup-tabell
            JSON.stringify(airtableData),
            "responseFollowUp"
        );
        console.log("Follow-up data sent to Airtable:", airtableData);
    }else{
        currentFollowingUp = airtableData; 
    }


}
  
function sendDataToZapierWebhookCreatUser(data) {
  let url = "https://hooks.zapier.com/hooks/catch/10455257/ubd0mdj/"
  sendDataToZapierWebhook(data, url);
}

function sendCalendarEventToZapier(data) {
    let url = "https://hooks.zapier.com/hooks/catch/10455257/ub5xabo/"
    sendDataToZapierWebhook(data, url);

}

async function sendDataToZapierWebhook(data,url) {
    const formData = new FormData();
    for (const key in data) {
        const value = data[key];
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }

    const response = await fetch(url, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        console.error("Error sending data to Zapier:", response.statusText);
    }
}

function formatDateAndTime(isoDateStr) {
  const date = new Date(isoDateStr);

  const day = date.getDate(); // f.eks. 26
  const month = date.getMonth() + 1; // f.eks. 6
  const year = date.getFullYear(); // f.eks. 2025
  const hours = String(date.getHours()).padStart(2, '0'); // f.eks. 17
  const minutes = String(date.getMinutes()).padStart(2, '0'); // f.eks. 53

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function toLocalInputString(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }