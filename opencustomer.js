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

        itemElement.querySelector(".modelname").textContent = item.typemodel || "–";
        itemElement.querySelector(".modelname").setAttribute("data-field", "typemodel");

        itemElement.querySelector(".seriename").textContent = item.serial_number || "–";
        itemElement.querySelector(".seriename").setAttribute("data-field", "serial_number");

        itemElement.querySelector(".typelabel").textContent = item.typemodel || "–";
        itemElement.querySelector(".typelabel").setAttribute("data-field", "typemodel");

        itemElement.querySelector(".installdate").textContent = item.installed_date
        ? formatDate(item.installed_date)
        : "–";
        itemElement.querySelector(".installdate").setAttribute("data-field", "installed_date");

        itemElement.querySelector(".intervallable").textContent = item.intervall ? `${item.intervall} mnd.` : "–";
        itemElement.querySelector(".intervallable").setAttribute("data-field", "intervall");

        itemElement.querySelector(".locationlable").textContent = item.location || "–";
        itemElement.querySelector(".locationlable").setAttribute("data-field", "location");

        itemElement.querySelector(".notelable").textContent = item.notes || "–";
        itemElement.querySelector(".notelable").setAttribute("data-field", "notes");

  
        systemListContainer.appendChild(itemElement);

        itemElement.querySelectorAll("[data-field]").forEach((el) => {
            el.classList.add("editable");
            el.addEventListener("click", () => handleSystemEdit(el, item, customer));
        });

      
    });
  }
  
  // Formater dato som "01. feb. 2020"
  function formatDate(dateStr) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('no-NO', options);
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

        console.log(data);

}

function handleSystemEdit(element, systemItem, customer) {
    const field = element.dataset.field;
    const originalValue = (systemItem[field] || "").toString();
    
    const input = document.createElement("input");
    input.type = "text";
    input.value = originalValue;
    input.className = "edit-input";
    element.innerHTML = '';
    element.appendChild(input);
    input.focus();
  
    input.addEventListener("blur", async () => {
      const newValue = input.value.trim();
      element.textContent = newValue || "–";
  
      if (newValue === originalValue) return; // ingen endring
  
      // Oppdater lokalt system
      systemItem[field] = newValue;
  
      // Oppdater i gCustomer (finn riktig system via rawid)
      const customerIndex = gCustomer.findIndex(c => c.client === customer.client);
      if (customerIndex !== -1) {
        const systems = gCustomer[customerIndex].system;
        const sysIndex = systems.findIndex(s => s.rawid === systemItem.rawid);
        if (sysIndex !== -1) {
          systems[sysIndex][field] = newValue;
        }
      }
  
      // Send til server
      const body = {};
      body[field] = newValue;
  
      PATCHairtable("appuUESr4s93SWaS7", "tbloIYTeuqo36rupe", systemItem.rawid, JSON.stringify(body), "responseEditSystem");
    });
  }
  
  function responseEditSystem(data) {
    console.log("System updated:", data);

  }