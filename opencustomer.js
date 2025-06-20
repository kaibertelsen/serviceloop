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

    //kopier systemelement
    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".systemelement");
    if (!nodeElement) {
        console.error("Ingen '.supplier' funnet i 'elementlibrary'.");
        return;
    }

    // Sett counter
    const counter = systemListContainer.parentElement.querySelector(".counter");
    if (!counter) {
        console.error("Ingen '.counter' funnet i containerens forelder.");
        return;
    }
    counter.textContent = customer.system.length + " stk.";
    counter.style.display = "block";

    customer.system.forEach((item, index) => {
        const itemElement = nodeElement.cloneNode(true);

        systemListContainer.appendChild(itemElement);
  

    });



    
   
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