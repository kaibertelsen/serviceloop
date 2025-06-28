var currentSystem = null;

function listSystemOnCustomer(customer) {
    const systemListContainer = document.getElementById('systemlist');
    systemListContainer.innerHTML = ''; // Tøm containeren
  
    if (!customer.system || customer.system.length === 0) {
      systemListContainer.textContent = "Ingen systemer funnet for denne kunden.";
      return;
    }
  
    // Hent mal fra elementbibliotek
    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
      console.error("Ingen 'elementlibrary' funnet.");
      return;
    }
  

    const nodeElement = elementLibrary.querySelector(".systemwrapper");
    if (!nodeElement) {
      console.error("Ingen '.systemwrapper' funnet i 'elementlibrary'.");
      return;
    }
  
    // Oppdater counter
    const counter = systemListContainer.parentElement.querySelector(".counter");
    if (counter) {
      counter.textContent = customer.system.length + " stk.";
      counter.style.display = "block";
    }

    // sorter systemer etter installasjonsdato
    customer.system.sort((a, b) => {
      const dateA = new Date(a.installed_date || 0);
      const dateB = new Date(b.installed_date || 0);
      return dateB - dateA; // Sorter synkende
    });
  
    customer.system.forEach((item) => {

      let itemElement = createSystemElement(nodeElement, item, customer);
      systemListContainer.appendChild(itemElement);

    });
}

function createSystemElement(nodeElement, item, customer){

    const itemElement = nodeElement.cloneNode(true);

    const moreconteiner = itemElement.querySelector(".moreconteiner");
    const showhidetugglemorebutton = itemElement.querySelector(".showhidetugglemorebutton");

    // Start skjult
    moreconteiner.style.height = "0px";

    let isOpen = false;

    showhidetugglemorebutton.addEventListener("click", () => {
      if (!isOpen) {
        // Åpne: Sett eksplisitt høyde først, for animasjon
        moreconteiner.style.height = moreconteiner.scrollHeight + "px";

        // Etter animasjon, fjern høyde for å støtte dynamisk innhold senere
        setTimeout(() => {
          moreconteiner.style.height = "auto";
        }, 400); // samsvarer med transition-tiden
      } else {
        // Lukke: Sett eksplisitt høyde før overgang tilbake til 0
        moreconteiner.style.height = moreconteiner.scrollHeight + "px";
        requestAnimationFrame(() => {
          moreconteiner.style.height = "0px";
        });
      }

      isOpen = !isOpen;
    });

    const notebuttonshowhide = itemElement.querySelector(".notebuttonshowhide");
    const noteconteiner = itemElement.querySelector(".noteconteiner");
    // Start skjult etter 400ms
    noteconteiner.style.height = "0px";

    let isNoteOpen = false;
    notebuttonshowhide.addEventListener("click", () => {
      if (!isNoteOpen) {
        // Åpne notatfelt
        noteconteiner.style.height = noteconteiner.scrollHeight + "px";
        setTimeout(() => {
          noteconteiner.style.height = "auto"; // Fjern høyde for dynamisk innhold
        }, 400); // samsvarer med transition-tiden
      } else {
        // Lukke notatfelt
        noteconteiner.style.height = noteconteiner.scrollHeight + "px";
        requestAnimationFrame(() => {
          noteconteiner.style.height = "0px";
        });
      }
      isNoteOpen = !isNoteOpen;
    }
    );


      // Fyll inn verdiene uten labeltekst
      itemElement.querySelector(".systemname").textContent = item.name || "Ukjent anlegg";
      itemElement.querySelector(".systemname").setAttribute("data-field", "name");

    //Modell selector
      let modelselector = itemElement.querySelector(".editselectmodell");
      //fjern tidligere options
      modelselector.innerHTML = ""; // Tøm eksisterende options
      
      // "Opprett ny modell"-valg øverst
      const createOption = document.createElement("option");
      createOption.value = "__create__";
      createOption.textContent = "➕ Opprett ny modell";
      modelselector.appendChild(createOption);
      
      // Sortert liste over modeller
      const sortedTypes = [...gSystem_type].sort((a, b) =>
        a.name.localeCompare(b.name, 'no', { sensitivity: 'base' })
      );
      
      sortedTypes.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type.rawid;
        opt.textContent = type.name;
        modelselector.appendChild(opt);
      });
      
      // Sett valgt modell hvis finnes
      if(item.system_type_id) {
        modelselector.value = item.system_type_id; // Sett valgt modell basert på system_type_id
      }else{
        //legg til "Velg modell" som første valg
        const selectOption = document.createElement("option");
        selectOption.value = "";
        selectOption.textContent = "Velg modell";
        modelselector.insertBefore(selectOption, modelselector.firstChild);
        modelselector.value = ""; // Sett til tomt for å vise "Velg modell"
      }
      
      
      // Reager på "Opprett ny modell"
      modelselector.addEventListener("change", () => {
        if (modelselector.value === "__create__") {
          handleCreateNewModel(nodeElement, item, customer);
        } else {
          // Eventuelt send oppdatering til server her
          let data = {system_type:[modelselector.value]};
          sendEditSystemToServer(item, data);
        }
      });

      itemElement.querySelector(".seriename").textContent = item.serial_number || "–";
      itemElement.querySelector(".seriename").setAttribute("data-field", "serial_number");

    //Datofelt
        let datofelt = itemElement.querySelector(".installdate");
        datofelt.value = item.installed_date
        ? new Date(item.installed_date).toISOString().split("T")[0]
        : "";
        datofelt.addEventListener("change", () => {
          let data = {installed_date: datofelt.value};
          //live ny utregning
          item.installed_date = datofelt.value;
          calcserviceDate(item,intervallinput,itemElement);
          sendEditSystemToServer(item, data);
          //list servicene på nytt
          listServiceOnsystem(itemElement, item, customer);
        });

        // Oppdater service
        let serviceinfo = findserviceinfo(item);
        const lastservicelable = itemElement.querySelector(".lastservicelable");
        lastservicelable.textContent = serviceinfo.lastservice || "Ingen service";
        
        // Oppdater farge og dato
        const nextservicelable = itemElement.querySelector(".nextservicelable");
        nextservicelable.textContent = serviceinfo.nextservice || "–";
        nextservicelable.style.color = serviceinfo.color;

        // Oppdater serviceintervall-input
        const intervallinput = itemElement.querySelector(".serviceintervall");
        intervallinput.value = item.intervall || "";
        intervallinput.addEventListener("change", () => {
            //live ny utregning og oppdater lable
            calcserviceDate(item,intervallinput,itemElement);
        });

        intervallinput.addEventListener("blur", () => {
            calcserviceDate(item,intervallinput,itemElement);
            sendEditSystemToServer(item, {intervall: Number(intervallinput.value)});
            //list servicene på nytt
            listServiceOnsystem(itemElement, item, customer);
        });

      // Oppdater lokasjon
      itemElement.querySelector(".locationlable").textContent = item.location || "–";
      itemElement.querySelector(".locationlable").setAttribute("data-field", "location");
      
      // Oppdater notat
      let noteText = itemElement.querySelector(".notehtmlquill");

      //Opprett Quill-editor
      var quill = new Quill(noteText, {
        theme: 'snow',
        modules: {
            toolbar: true // Viktig for at den skal bli generert
        }
      });


      // 3. Lim inn eksisterende HTML-basert notat (kan inneholde <br> osv.)
      setTimeout(() => {
        quill.clipboard.dangerouslyPasteHTML(item.notes || "");
      }, 0);
      
      // 4. Lytt etter blur (når man forlater editoren)
      quill.root.addEventListener("blur", function () {
        // Hent HTML-innholdet fra Quill-editoren
        let noteContent = quill.root.innerHTML;
        console.log("Note content:", noteContent);
        //send til server
        let data = {notes: noteContent};
        sendEditSystemToServer(item, data);
      });

      itemElement.querySelectorAll("[data-field]").forEach((el) => {
          el.classList.add("editable");
          el.addEventListener("click", () => handleSystemEdit(el, item, customer));
      });

    //deletesystembutton
    const deleteButton = itemElement.querySelector(".deletesystembutton");
    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        deleteSystem(itemElement, item, customer);
      });
    }

    //lage klikk event på newservicebutton
    const newServiceButton = itemElement.querySelector(".newservicebutton");
    if (newServiceButton) {
        newServiceButton.addEventListener("click", function () {
            makeNewService(itemElement,item, customer, null);
        });
    }

    //sett bakgrunsfarge på knappen som tilsvarer status "kalkulert"
    const statusObj = statusService.find(status => status.value.toLowerCase() === "kalkulert");
    if (statusObj) {
        newServiceButton.style.backgroundColor = statusObj.color; // Sett bakgrunnsfarge basert på status
    }

    // Liste opp servicer
    listServiceOnsystem(itemElement, item, customer);


    // Returner det oppdaterte elementet
    return itemElement;

}

function deleteSystem(itemElement, system, customer) {

    //sjekk om det er servicer på dette systemet, har den status "kalkulert" så kan systemet slettes
    const hasKalkulertService = system.service && system.service.some(s => s.status && s.status.toLowerCase() === "kalkulert");
    if (system.service && system.service.length > 0 && !hasKalkulertService) {
        alert("Dette systemet har registrerte servicer. Du kan ikke slette systemet før alle servicer er slettet.");
        return;
    }


    if (confirm("Er du sikker på at du vil slette dette systemet?")) {
        // Send DELETE forespørsel til server
        DELETEairtable("appuUESr4s93SWaS7", "tbloIYTeuqo36rupe", system.rawid, "responseDeleteSystem");

        // Fjern systemet fra kundens liste
        const customerIndex = gCustomer.findIndex(c => c.rawid === currentCustomer.rawid);
        if (customerIndex !== -1) {
          const systemIndex = gCustomer[customerIndex].system.findIndex(s => s.rawid === system.rawid);
          if (systemIndex !== -1) {
            gCustomer[customerIndex].system.splice(systemIndex, 1);
          }
        }
        // Oppdater systemlisten for kunden
        listSystemOnCustomer(currentCustomer);
       
      }
}

function openServiceEditModal(service, system, customer) {
  //trykk på tabbutton
  const serviceTabButton = document.getElementById("serviceTabbutton");
  if (serviceTabButton) serviceTabButton.click();
  // Opprett modalinnhold
}

function createNewSystem() {
    if (!currentCustomer || !currentCustomer.client || !currentCustomer.rawid) {
      alert("Ingen kunde valgt.");
      return;
    }
  
    // 1. Opprett nytt systemobjekt
    const newSystem = {
      name: "Nytt anlegg",
      installed_date: new Date().toISOString().split("T")[0], // dagens dato
      intervall: 12,
      customer: [currentCustomer.rawid]
    };
  
    // 2. Vis loader i systemlisten
    const elementLibrary = document.getElementById("elementlibrary");
    const loaderElement = elementLibrary?.querySelector(".loaderconteiner");
    const systemListContainer = document.getElementById("systemlist");
  
    if (loaderElement && systemListContainer) {
      const loaderClone = loaderElement.cloneNode(true);
      systemListContainer.prepend(loaderClone); // legg til øverst
    }
  
    // 3. Send til server (POST til Airtable)
    POSTairtable(
      "appuUESr4s93SWaS7",
      "tbloIYTeuqo36rupe", // system-tabell
      JSON.stringify(newSystem),
      "responseNewSystem"
    );
}
  
function responseNewSystem(response) {
    console.log("System opprettet:", response);
  
   let newSystem = JSON.parse(response.fields.json);
    // Legg til det nye systemet i kundens systemliste
    if (currentCustomer && currentCustomer.system) {
      currentCustomer.system.push(newSystem);
    } else {
      currentCustomer.system = [newSystem];
    }
  
    // Oppdater systemlisten for kunden
    listSystemOnCustomer(currentCustomer);
  
    // Fjern loaderen
    const systemListContainer = document.getElementById("systemlist");
    const loaderElement = systemListContainer.querySelector(".loaderconteiner");
    if (loaderElement) loaderElement.remove();
    // Oppdater systemantall
    const counter = systemListContainer.parentElement.querySelector(".counter");
    if (counter) {
      counter.textContent = currentCustomer.system.length + " stk.";
      counter.style.display = "block";
    }
  
}

function responseDeleteSystem(data) {
    console.log("System slettet:", data);
}
  
function handleSystemEdit(element, systemItem, customer) {
    const field = element.dataset.field;
    const originalRawid = systemItem[field] ?? "";
    const originalValue = originalRawid.toString();
  
    let input;
  
   if (field === "installed_date") {
      input = document.createElement("input");
      input.type = "date";
      input.className = "edit-input";
      input.value = originalValue ? new Date(originalValue).toISOString().split("T")[0] : "";
  
    } else if (field === "intervall") {
      input = document.createElement("input");
      input.type = "number";
      input.className = "edit-input";
      input.value = originalValue;
  
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "edit-input";
      input.value = originalValue;
    }
  
    element.innerHTML = '';
    element.appendChild(input);
    input.focus();
  
    input.addEventListener("blur", async () => {
      let newValue = input.value.trim();
  
      if (field === "intervall") {
        newValue = newValue ? Number(newValue) : null;
      } else if (field === "installed_date") {
        newValue = newValue || null;
      }
  
      if (field === "typemodel") {
        const selectedModel = gSystem_type.find(type => type.rawid === newValue);
        element.textContent = selectedModel ? selectedModel.name : "–";
      } else {
        element.textContent = newValue || "–";
      }
  
      const normalizedOriginal = field === "intervall" ? Number(originalValue) : originalValue;
      if (newValue === normalizedOriginal) return;
  
      const body = {};
      body[field] = newValue;
  
      sendEditSystemToServer(systemItem, body);
    });
}
  
function sendEditSystemToServer(systemItem, data) {
    let body = JSON.stringify(data);
    let rawid = systemItem.rawid;
    PATCHairtable("appuUESr4s93SWaS7", "tbloIYTeuqo36rupe", rawid, body, "responseEditSystem");
}
  
function responseEditSystem(data) {
    console.log("System updated:", data);
  
    const updatedSystem = JSON.parse(data.fields.json);
    const customerIndex = gCustomer.findIndex(c => c.rawid === currentCustomer.rawid);
    if (customerIndex !== -1) {
      const systemIndex = gCustomer[customerIndex].system.findIndex(s => s.rawid === updatedSystem.rawid);
      if (systemIndex !== -1) {
        gCustomer[customerIndex].system[systemIndex] = updatedSystem;
      }
    }
    
  
}
  
function handleCreateNewModel(nodeElement, item, customer) {
    currentSystem = item; // Sett det nåværende systemet for å bruke i responsen
    // Vis f.eks. et popup-skjema hvor en kan angi modellnavn
    const modelName = prompt("Skriv inn navnet på den nye modellen:");
    if (!modelName) {
        alert("Modellnavn kan ikke være tomt.");
        return;
    }
    // Opprett nytt systemtypeobjekt
    const newModel = {
        name: modelName,
        client: [currentCustomer.client] // Legg til klient-ID
    };

    // Send til server (POST til Airtable)
    POSTairtable(
        "appuUESr4s93SWaS7",
        "tble7pEg5BaVNS3o5", // system_type-tabell
        JSON.stringify(newModel),
        "responseNewModel"
    );

    // Vis loader i systemlisten
    const elementLibrary = document.getElementById("elementlibrary");
    const loaderElement = elementLibrary?.querySelector(".loaderconteiner");
    const systemListContainer = document.getElementById("systemlist");
    if (loaderElement && systemListContainer) {
        const loaderClone = loaderElement.cloneNode(true);
        systemListContainer.prepend(loaderClone); // legg til øverst
    }
   
}

function responseNewModel(data) {

    console.log("Ny modell opprettet:", data);
  
    // Legg til den nye modellen i system_type-listen
    const newModel = JSON.parse(data.fields.json);
    gSystem_type.push(newModel);

    //Oppdater systemet lokalt
    currentSystem.system_type_id = newModel.rawid; // Sett system_type til den nye modellens rawid

    //Legg systemtype til systemet server
    let dataToUpdate = {system_type: [newModel.rawid]};
    sendEditSystemToServer(currentSystem, dataToUpdate);

    // Fjern loaderen
    const systemListContainer = document.getElementById("systemlist");
    const loaderElement = systemListContainer.querySelector(".loaderconteiner");
    if (loaderElement) loaderElement.remove();
    
    //last inn systemer på nytt
    if (systemListContainer) {
        listSystemOnCustomer(currentCustomer);
    } else {
        console.error("Ingen systemliste funnet.");
    }
  
}