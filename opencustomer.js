let currentCustomer = {};


document.getElementById("createNewSystemButton").addEventListener("click", function () {
  createNewSystem();
});

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

  const customerinfoconteiner = document.querySelector('.customerinfoconteiner');

  const customernameelement = customerinfoconteiner.querySelector('.customernameelement');
  customernameelement.value = customer.name || "-";
  customernameelement.addEventListener('blur', function () {
    const newName = customernameelement.value.trim();
    if (newName !== customer.name) {
      editCustomerFiels(customer, 'name', newName);
    }
  });

  const primarycontactelement = customerinfoconteiner.querySelector('.primarycontact');
  primarycontactelement.value = customer.primary_contact || "-";
  primarycontactelement.addEventListener('blur', function () {
    const newContact = primarycontactelement.value.trim();
    if (newContact !== customer.primarycontact) {
      editCustomerFiels(customer, 'primarycontact', newContact);
    }
  });

  const customeremailelement = customerinfoconteiner.querySelector('.customeremail');
  customeremailelement.value = customer.email || "-";
  customeremailelement.addEventListener('blur', function () {
    const newEmail = customeremailelement.value.trim();
    if (newEmail !== customer.email) {
      editCustomerFiels(customer, 'email', newEmail);
    }
  }
  );

  const customernumberelement = customerinfoconteiner.querySelector('.customernumber');
  customernumberelement.value = customer.customernr || "-";
  customernumberelement.addEventListener('blur', function () {
    const newNumber = customernumberelement.value.trim();
    if (newNumber !== customer.customernr) {
      editCustomerFiels(customer, 'customernr', newNumber);
    }
  });

  const editselectcustomertypeSelector = customerinfoconteiner.querySelector('.editselectcustomertype');
  editselectcustomertypeSelector.value = customer.type || "privat";
  editselectcustomertypeSelector.addEventListener('change', function () {
    const newType = editselectcustomertypeSelector.value;
    if (newType !== customer.type) {
      editCustomerFiels(customer, 'type', newType);
    }
  });


  const customercategoryelement = customerinfoconteiner.querySelector('.customercategory');
  customercategoryelement.value = customer.category || "-";
  customercategoryelement.addEventListener('blur', function () {
    const newCategory = customercategoryelement.value.trim();
    if (newCategory !== customer.category) {
      editCustomerFiels(customer, 'category', newCategory);
    }
  });

  const customeraddressElement = customerinfoconteiner.querySelector('.customeraddress');
  customeraddressElement.value = customer.address || "-";
  customeraddressElement.addEventListener('blur', function () {
    const newAddress = customeraddressElement.value.trim();
    if (newAddress !== customer.address) {
      editCustomerFiels(customer, 'address', newAddress);
    }
  });

  const customerpostcodeElement = customerinfoconteiner.querySelector('.customerpostcode');
  customerpostcodeElement.value = customer.postcode || "-";
  customerpostcodeElement.addEventListener('blur', function () {
    const newPostcode = customerpostcodeElement.value.trim();
    if (newPostcode !== customer.postcode) {
      editCustomerFiels(customer, 'postcode', newPostcode);
    }
  });


  const customercityElement = customerinfoconteiner.querySelector('.customercity');
  customercityElement.value = customer.city || "-";
  customercityElement.addEventListener('blur', function () {
    const newCity = customercityElement.value.trim();
    if (newCity !== customer.city) {
      editCustomerFiels(customer, 'city', newCity);
    }
  });


    //list opp anlegg/ systems
    listSystemOnCustomer(customer);
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
  customer[field] = newValue;

  let body = {
    [field]: newValue
  };

  sendUpdateToServer(customer, body);
}




  
function sendUpdateToServer(customer, data) {

    let body = JSON.stringify(data);
    let rawid = customer.rawid;
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

