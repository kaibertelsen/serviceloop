let currentCustomer = {};

document.getElementById("fromCustomerToListButton").addEventListener("click", function () {
    listCustomers(gCustomer);

      // Trykk på faneknappen
    const listTabButton = document.getElementById("listpagetabbutton");
    if (listTabButton) listTabButton.click();

  });
  

function openCustomer(customer) {
  currentCustomer = customer;

  // Trykk på faneknappen for kunden
  const customerTabButton = document.getElementById("customertabbutton");
  if (customerTabButton) customerTabButton.click();

  document.querySelector("[data-field='type']").textContent = "Kundenummer: " + (customer.customernr || "");
  document.querySelector("[data-field='name']").textContent = customer.name || "";
  document.querySelector("[data-field='address']").textContent = customer.address || "";

  const postAndCity = [customer.postcode, customer.city].filter(Boolean).join(" ");
  document.querySelector("[data-field='postcode_city']").textContent = postAndCity;

  const emailContainer = document.querySelector("[data-field='email']");
    if (customer.email) {
    emailContainer.innerHTML = `E-post: <span class="email-text">${customer.email}</span>`;
    } else {
    emailContainer.textContent = "E-post: –";
    }

    //list opp anlegg/ systems
    listSystemOnCustomer(customer);
}

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
  
    customer.system.forEach((item) => {
      const itemElement = nodeElement.cloneNode(true);
  
        // Fyll inn verdiene uten labeltekst
        itemElement.querySelector(".systemname").textContent = item.name || "Ukjent anlegg";
        itemElement.querySelector(".systemname").setAttribute("data-field", "name");

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
        if(item.system_type_json && item.system_type_json.length > 0) {
          modelselector.value = item.system_type_json[0].rawid;
          
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
            handleCreateNewModel();
            modelselector.value = item.typemodel || "";
          } else {
            // Eventuelt send oppdatering til server her
            let data = {system_type:[modelselector.value]};
            sendEditSystemToServer(item, data);
          }
        });

        itemElement.querySelector(".seriename").textContent = item.serial_number || "–";
        itemElement.querySelector(".seriename").setAttribute("data-field", "serial_number");

        let datofelt = itemElement.querySelector(".installdate");
        datofelt.value = item.installed_date
        ? new Date(item.installed_date).toISOString().split("T")[0]
        : "";
        datofelt.addEventListener("change", () => {
            let data = {installed_date: datofelt.value};
            //live ny utregning
            calcserviceDate(item, itemElement);
            //sendEditSystemToServer(item, data);
        }
        );

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
            let data = {intervall: intervallinput.value};
            //live ny utregning 
            calcserviceDate(item,itemElement);
            //sendEditSystemToServer(item, data);
          }
        );

        intervallinput.addEventListener("blur", () => {
            let data = {intervall: Number(intervallinput.value)};
            sendEditSystemToServer(item, data);
          }
        );

        itemElement.querySelector(".locationlable").textContent = item.location || "–";
        itemElement.querySelector(".locationlable").setAttribute("data-field", "location");
        
        // 1. Finn elementet du skal bruke som editor-container
        let noteText = itemElement.querySelector(".notehtmlquill");

        // 1. Opprett Quill-editor
        var quill = new Quill(noteText, {
          theme: 'snow',
          modules: {
              toolbar: true // Viktig for at den skal bli generert
          }
        });


        // 3. Lim inn eksisterende HTML-basert notat (kan inneholde <br> osv.)
        quill.clipboard.dangerouslyPasteHTML(item.note || "");

        // 4. Lytt etter blur (når man forlater editoren)
        quill.root.addEventListener("blur", function () {
          // Hent HTML-innholdet fra Quill-editoren
          let noteContent = quill.root.innerHTML;
          console.log("Note content:", noteContent);
        });

        

        systemListContainer.appendChild(itemElement);

        itemElement.querySelectorAll("[data-field]").forEach((el) => {
            el.classList.add("editable");
            el.addEventListener("click", () => handleSystemEdit(el, item, customer));
        });

      
    });
  }
  
function  calcserviceDate(system, itemElement) {

  const intervallinput = itemElement.querySelector(".serviceintervall");
  const intervall = intervallinput.value;


    const today = new Date();
    let lastService = null;
    let nextService = null;

    // 1. Finn siste service (dersom finnes)
    if (system.service && system.service.length > 0) {
      const sorted = system.service
        .filter(s => !!s.date) // sørg for at dato finnes
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      lastService = sorted.length > 0 ? new Date(sorted[0].date) : null;
    }

    // 2. Beregn neste service
    const interval = parseInt(intervall || "0");

    if (lastService) {
      nextService = new Date(lastService);
      nextService.setMonth(nextService.getMonth() + interval);
    } else {
      const inputInstalled = itemElement.querySelector(".installdate");
      const installedDate = inputInstalled.value;
      if (!installedDate) {
        nextService = null; // Ingen installert dato, ingen neste service
        return;
      }
      // Hvis ingen siste service, bruk installert dato
      const installed = new Date(installedDate);
      nextService = new Date(installed);
      nextService.setMonth(installed.getMonth() + interval);
    }

    // 3. Evaluer farge
    let color = "gray"; // default
    if (nextService) {
      const isOverdue = nextService < today;
      color = isOverdue ? "red" : "green";
    }

    // Oppdater visning
    itemElement.querySelector(".lastservicelable").textContent = lastService ? formatDate(lastService) : "Ingen service";
    itemElement.querySelector(".nextservicelable").textContent = nextService ? formatDate(nextService) : "–";
    itemElement.querySelector(".nextservicelable").style.color = color;
  }


  function findserviceinfo(system) {
    console.log("findserviceinfo for system:", system);
  
    const today = new Date();
    let lastService = null;
    let nextService = null;
  
    // 1. Finn siste service (dersom finnes)
    if (system.service && system.service.length > 0) {
      const sorted = system.service
        .filter(s => !!s.date) // sørg for at dato finnes
        .sort((a, b) => new Date(b.date) - new Date(a.date));
  
      lastService = sorted.length > 0 ? new Date(sorted[0].date) : null;
    }
  
    // 2. Beregn neste service
    const interval = parseInt(system.intervall || "0");
  
    if (lastService) {
      nextService = new Date(lastService);
      nextService.setMonth(nextService.getMonth() + interval);
    } else if (system.installed_date && interval > 0) {
      const installed = new Date(system.installed_date);
      nextService = new Date(installed);
      nextService.setMonth(installed.getMonth() + interval);
    }
  
    // 3. Evaluer farge
    let color = "gray"; // default
    if (nextService) {
      const isOverdue = nextService < today;
      color = isOverdue ? "red" : "green";
    }
  
    return {
      lastservice: lastService ? formatDate(lastService) : null,
      nextservice: nextService ? formatDate(nextService) : null,
      color
    };
  }
  
// Hjelpefunksjon for visning
function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

  

document.querySelector('.customerinfoconteiner').addEventListener('click', function (e) {
  const fieldEl = e.target.closest('.editable');
  if (!fieldEl) return;

  const field = fieldEl.dataset.field;
  if (!field) return;

  handleEditField(fieldEl, field);
});

function handleEditField(fieldEl, field) {
    let currentValue = currentCustomer[field];
  
    if (field === 'postcode_city') {
      currentValue = [currentCustomer.postcode, currentCustomer.city].filter(Boolean).join(" ");
    } else if (field === 'email') {
      currentValue = currentCustomer.email || "";
    }
  
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue || '';
    input.className = 'edit-input';
  
    fieldEl.innerHTML = '';
    fieldEl.appendChild(input);
    input.focus();
  
    input.addEventListener('blur', async () => {
      const newValue = input.value.trim();
  
      if (field === 'postcode_city') {
        const [postcode, ...cityParts] = newValue.split(' ');
        const city = cityParts.join(' ').trim();
  
        currentCustomer.postcode = postcode || '';
        currentCustomer.city = city || '';
  
        const customerIndex = gCustomer.findIndex(c => c.client === currentCustomer.client);
        if (customerIndex !== -1) {
          gCustomer[customerIndex].postcode = postcode || '';
          gCustomer[customerIndex].city = city || '';
        }
  
        openCustomer(currentCustomer);
  
        let body = {
          postcode: Number(postcode),
          city: city
        };
        sendUpdateToServer(currentCustomer, body);
  
      } else {
        if (field === 'email' && newValue !== '') {
          // Valider e-post
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(newValue)) {
            alert("Ugyldig e-postadresse");
            openCustomer(currentCustomer); // tilbakestill visning
            return;
          }
        }
  
        currentCustomer[field] = newValue;
  
        const customerIndex = gCustomer.findIndex(c => c.client === currentCustomer.client);
        if (customerIndex !== -1) {
          gCustomer[customerIndex][field] = newValue;
        }
  
        openCustomer(currentCustomer);
  
        let body = {
          [field]: newValue
        };
        sendUpdateToServer(currentCustomer, body);
      }
    });
}
  
  

function sendUpdateToServer(customer, data) {

    let body = JSON.stringify(data);
    let rawid = customer.rawid;
    PATCHairtable("appuUESr4s93SWaS7","tblB0ZV5s0oXiAP6x",rawid,body,"responseEditCustomer");

}


function responseEditCustomer(data){
  //oppdater gCustomer med den oppdaterte kunden
  const updatedCustomer = JSON.parse(data.fields);
  const customerIndex = gCustomer.findIndex(c => c.rawid === updatedCustomer.rawid);
  if (customerIndex !== -1) {
    gCustomer[customerIndex] = updatedCustomer;
  }
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
      listSystemOnCustomer(gCustomer[customerIndex]); // Refresh the system list
    }
  }
  

}


function handleCreateNewModel() {
  // Vis f.eks. et popup-skjema eller gå til en egen side
  alert("Her kan du opprette en ny modell.");
  // Du kan også trigge en modal, Webflow-interaction, eller lignende
}