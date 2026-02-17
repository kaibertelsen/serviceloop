let currentCustomer = {};
let isCustomerHandlersBound = false;


document.getElementById("createNewSystemButton").addEventListener("click", function () {
  createNewSystem();
});

document.getElementById("fromCustomerToListButton").addEventListener("click", function () {
    listCustomers(gCustomer);
    isInCustomarpage = false;
      // Trykk på faneknappen
    const listTabButton = document.getElementById("listpagetabbutton");
    if (listTabButton) listTabButton.click();

});

function openCustomer(customer) {
  isInCustomarpage = true;
  currentCustomer = customer;

  console.log("Åpner kunde:", customer);

  // Trykk på faneknappen for kunden
  const customerTabButton = document.getElementById("customertabbutton");
  if (customerTabButton) customerTabButton.click();

  const customerinfoconteiner = document.querySelector('.customerinfoconteiner');
  if (!customerinfoconteiner) {
    console.warn("Fant ikke .customerinfoconteiner");
    return;
  }

  // Hent elementer
  const customernameelement = customerinfoconteiner.querySelector('.customernameelement');
  const primarycontactelement = customerinfoconteiner.querySelector('.primarycontact');
  const customeremailelement = customerinfoconteiner.querySelector('.customeremail');
  const customernumberelement = customerinfoconteiner.querySelector('.customernumber');
  const editselectcustomertypeSelector = customerinfoconteiner.querySelector('.editselectcustomertype');
  const customercategoryelement = customerinfoconteiner.querySelector('.customercategory');
  const customeraddressElement = customerinfoconteiner.querySelector('.customeraddress');
  const customerpostcodeElement = customerinfoconteiner.querySelector('.customerpostcode');
  const customercityElement = customerinfoconteiner.querySelector('.customercity');
  const phonenumberElement = customerinfoconteiner.querySelector('.phonenumber');

  // Sett verdier for aktiv kunde (ingen listeners her)
  if (customernameelement) customernameelement.value = customer.name || "";
  if (primarycontactelement) primarycontactelement.value = customer.primary_contact || "";
  if (customeremailelement) customeremailelement.value = customer.email || "";
  if (customernumberelement) customernumberelement.value = customer.customernr || "";
  if (editselectcustomertypeSelector) editselectcustomertypeSelector.value = customer.type || "privat";
  if (customercategoryelement) customercategoryelement.value = customer.category || "";
  if (customeraddressElement) customeraddressElement.value = customer.address || "";
  if (customerpostcodeElement) customerpostcodeElement.value = customer.postcode || "";
  if (customercityElement) customercityElement.value = customer.city || "";
  if (phonenumberElement) phonenumberElement.value = customer.phonenumber || "";

  // Bind event handlers kun én gang
  if (!isCustomerHandlersBound) {
    isCustomerHandlersBound = true;

    if (customernameelement) {
      customernameelement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newName = customernameelement.value.trim();
        if (newName !== (currentCustomer.name || "")) {
          editCustomerFiels(currentCustomer, 'name', newName);
        }
      });
    }

    if (primarycontactelement) {
      primarycontactelement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newContact = primarycontactelement.value.trim();
        if (newContact !== (currentCustomer.primary_contact || "")) {
          // Bruk samme feltnavn som i objektet ditt (primary_contact)
          editCustomerFiels(currentCustomer, 'primary_contact', newContact);
        }
      });
    }

    if (customeremailelement) {
      customeremailelement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newEmail = customeremailelement.value.trim();
        if (newEmail !== (currentCustomer.email || "")) {
          editCustomerFiels(currentCustomer, 'email', newEmail);
        }
      });
    }

    if (customernumberelement) {
      customernumberelement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newNumber = customernumberelement.value.trim();
        if (newNumber !== (currentCustomer.customernr || "")) {
          editCustomerFiels(currentCustomer, 'customernr', newNumber);
        }
      });
    }

    if (editselectcustomertypeSelector) {
      editselectcustomertypeSelector.addEventListener('change', () => {
        if (!currentCustomer) return;
        const newType = editselectcustomertypeSelector.value;
        if (newType !== (currentCustomer.type || "privat")) {
          editCustomerFiels(currentCustomer, 'type', newType);
        }
      });
    }

    if (customercategoryelement) {
      customercategoryelement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newCategory = customercategoryelement.value.trim();
        if (newCategory !== (currentCustomer.category || "")) {
          editCustomerFiels(currentCustomer, 'category', newCategory);
        }
      });
    }

    if (customeraddressElement) {
      customeraddressElement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newAddress = customeraddressElement.value.trim();
        if (newAddress !== (currentCustomer.address || "")) {
          editCustomerFiels(currentCustomer, 'address', newAddress);
        }
      });
    }

    if (customerpostcodeElement) {
      customerpostcodeElement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newPostcode = customerpostcodeElement.value.trim();
        if (newPostcode !== (currentCustomer.postcode || "")) {
          editCustomerFiels(currentCustomer, 'postcode', newPostcode);
        }
      });
    }

    if (customercityElement) {
      customercityElement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newCity = customercityElement.value.trim();
        if (newCity !== (currentCustomer.city || "")) {
          editCustomerFiels(currentCustomer, 'city', newCity);
        }
      });
    }

    if (phonenumberElement) {
      phonenumberElement.addEventListener('blur', () => {
        if (!currentCustomer) return;
        const newPhoneNumber = phonenumberElement.value.trim();
        if (newPhoneNumber !== (currentCustomer.phonenumber || "")) {
          // Du brukte 'phone' før — hvis objektet ditt heter phonenumber, hold det konsistent
          editCustomerFiels(currentCustomer, 'phonenumber', newPhoneNumber);
        }
      });
    }
  }

  // list opp anlegg/ systems
  listSystemOnCustomer(customer);
}


function deleteCustomer() {
  if (!currentCustomer) {
    console.warn("Ingen kunde valgt for sletting.");
    return;
  }

  const confirmation = confirm(`Er du sikker på at du vil slette kunden "${currentCustomer.name}"? Dette kan ikke angres.`);
  if (!confirmation) return;

  console.log("Sletter kunde:", currentCustomer);

  // Send slettingsforespørsel til serveren
  sendDeleteToServer(currentCustomer);

  // Fjern kunden fra gCustomer-arrayet
  gCustomer = gCustomer.filter(c => c.rawid !== currentCustomer.rawid);

  // Oppdater kundelisten
  listCustomers(gCustomer);


  // Lukk kundesiden og gå tilbake til listen
  const listTabButton = document.getElementById("listpagetabbutton");
  if (listTabButton) listTabButton.click();


}

function sendDeleteToServer(customer) {
  let rawid = customer.rawid;
  console.log("Sender slettingsforespørsel til server for kunde", rawid);
  DELETEairtable("appuUESr4s93SWaS7","tblB0ZV5s0oXiAP6x",rawid,"responseDeleteCustomer");
}




  
function  calcserviceDate(system,intervallinput, itemElement) {
    // Hent intervall fra input
    system.intervall = Number(intervallinput.value);

    let serviceinfo = findserviceinfo(system);
    // Oppdater visning
    itemElement.querySelector(".lastservicelable").textContent = serviceinfo.lastservice || "–";
    itemElement.querySelector(".nextservicelable").textContent = serviceinfo.nextservice || "–";
    itemElement.querySelector(".nextservicelable").style.color = serviceinfo.color;
}

function findserviceinfo(system) {
  const today = new Date();
  let lastService = null;
  let nextService = null;
  let suggestedService = null;

  const validStatuses = ["utført", "fakturert"];
  const services = Array.isArray(system.service) ? system.service : [];

  // 1. Finn siste service som er ferdigstilt (utført/fakturert)
  const completedServices = services
    .filter(s => !!s.date && validStatuses.includes((s.status || "").toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  lastService = completedServices.length > 0 ? new Date(completedServices[0].date) : null;

  // 2. Beregn neste service og sett tid til 08:00
  const interval = parseInt(system.intervall || "0");
  if (lastService && interval > 0) {
    nextService = new Date(lastService);
    nextService.setMonth(nextService.getMonth() + interval);
    nextService.setHours(8, 0, 0, 0); // Sett klokkeslett til 08:00
  } else if (system.installed_date && interval > 0) {
    const installed = new Date(system.installed_date);
    nextService = new Date(installed);
    nextService.setMonth(installed.getMonth() + interval);
    nextService.setHours(8, 0, 0, 0); // Sett klokkeslett til 08:00
  }

  // 3. Finn service innenfor nextService-vinduet (ekskluder lastService selv)
  let serviceInWindow = false;
  if (nextService) {
    const plus2Months = new Date(nextService);
    plus2Months.setMonth(plus2Months.getMonth() + 2);

    serviceInWindow = services.some(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      if (lastService && d.getTime() === lastService.getTime()) return false;
      return d > lastService && d <= plus2Months;
    });
  }

  // 4. Bestem om det skal foreslås service
  if (!serviceInWindow && nextService) {
    suggestedService = {
      date: nextService,
      status: "kalkulert",
      user: [gUser.rawid],
      followup: []
    };
  }

  // 5. Farge
  let color = "gray";
  if (nextService) {
    const isOverdue = nextService < today;
    color = isOverdue ? "red" : "green";
  }

  return {
    lastservice: lastService ? formatDate(lastService) : null,
    lastserviceDate: lastService || null,
    nextservice: nextService ? formatDate(nextService) : null,
    nextserviceDate: nextService || null,
    color,
    suggestedService
  };
}



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


function editCustomerFiels(customer, field, newValue) {

  //oppdater customer objektet
  console.log(`Oppdaterer felt "${field}" for kunde "${customer.name}" til:`, newValue);
  customer[field] = newValue;

  let body = {
    [field]: newValue
  };

  sendUpdateToServer(customer, body);


  //hvis det er type så må vi oppdaterer selector
  if (field === 'category') {
    loadCategorySelector(gCustomer);
  }
}




  
function sendUpdateToServer(customer, data) {

    let body = JSON.stringify(data);
    let rawid = customer.rawid;
    console.log("Sender oppdatering til server for kunde", rawid, "med data:", data);
    PATCHairtable("appuUESr4s93SWaS7","tblB0ZV5s0oXiAP6x",rawid,body,"responseEditCustomer");

}

function responseEditCustomer(data){
  //oppdater gCustomer med den oppdaterte kunden
  const updatedCustomer = JSON.parse(data.fields.json);
  const customerIndex = gCustomer.findIndex(c => c.rawid === updatedCustomer.rawid);
  if (customerIndex !== -1) {
    gCustomer[customerIndex] = updatedCustomer;
  }
}

