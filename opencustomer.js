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

  // 2. Beregn neste service
  const interval = parseInt(system.intervall || "0");
  if (lastService && interval > 0) {
    nextService = new Date(lastService);
    nextService.setMonth(nextService.getMonth() + interval);
  } else if (system.installed_date && interval > 0) {
    const installed = new Date(system.installed_date);
    nextService = new Date(installed);
    nextService.setMonth(installed.getMonth() + interval);
  }

  // 3. Finn service innenfor nextService-vinduet (ekskluder lastService selv)
  let serviceInWindow = false;
  if (nextService) {
    const plus2Months = new Date(nextService);
    plus2Months.setMonth(plus2Months.getMonth() + 2);

    serviceInWindow = services.some(s => {
      if (!s.date) return false;
      const d = new Date(s.date);
      // Ikke ta med lastService selv
      if (lastService && d.getTime() === lastService.getTime()) return false;
      return d > lastService && d <= plus2Months;
    });
  }

  // 4. Bestem om det skal foreslås service
  if (!serviceInWindow && nextService) {
    suggestedService = {
      date: nextService.toISOString(),
      status: "kalkulert",
      user: [gUser.rawid],
      followup:[]
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

