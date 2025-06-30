document.getElementById("elementlibrary").style.display = "none"; // Skjul elementbiblioteket


function startCustomerListPage(customers) {
    //last inn selectorfilter
    loadSystemTypeSelector();
    loadCategorySelector(customers);
    loadCustomerTypeSelector(customers);

    // Initialize the customer list page
    listCustomers(customers);
   
}

document.getElementById("customerCategory").addEventListener("change", () => listCustomers(gCustomer));
document.getElementById("customerSystemType").addEventListener("change", () => listCustomers(gCustomer));
document.getElementById("customerType").addEventListener("change", () => listCustomers(gCustomer));
document.getElementById("customerSearchfield").addEventListener("input", () => listCustomers(gCustomer));



function listCustomers(customers) {
    const categorySelector = document.getElementById("customerCategory");
    const customerTypeSelector = document.getElementById("customerType");
    const searchInput = document.getElementById("customerSearchfield");
    const systemSelector = document.getElementById("customerSystemType");

    const selectedCategory = categorySelector ? categorySelector.value.trim().toLowerCase() : "";
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedSystemId = systemSelector ? systemSelector.value.trim().toLowerCase() : "";
    const customerType = customerTypeSelector ? customerTypeSelector.value.trim().toLowerCase() : "";

    const filtered = customers.filter(customer => {
        const name = (customer.name || "").toLowerCase();
        const category = (customer.category || "").toLowerCase();
        const systems = Array.isArray(customer.system) ? customer.system : [customer.system];
        const type = (customer.type || "").toLowerCase();

        const matchesCategory = selectedCategory === "" || category === selectedCategory;
        const matchesCustomerType = customerType === "" || type.includes(customerType);
        const matchesSearch = searchTerm === "" || name.includes(searchTerm);

        // Nå matcher vi på system_type_id
        const matchesSystem = selectedSystemId === "" || systems.some(sys => {
            const sysTypeId = (sys.system_type_id || "").toLowerCase();
            return sysTypeId === selectedSystemId;
        });

        return matchesCategory && matchesSearch && matchesSystem && matchesCustomerType;
    });

    // Sorter alfabetisk
    filtered.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    listDatainList(filtered);
}


function loadSystemTypeSelector() {
    const customerSystemType = document.getElementById("customerSystemType");
    if (!customerSystemType) {
        console.error("Ingen 'customerSystemType' funnet.");
        return;

    }

    // Tøm eksisterende alternativer
    customerSystemType.innerHTML = '';
    // Legg til en tom valgmulighet
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Alle systemer";
    customerSystemType.appendChild(emptyOption);

    let systemTypes = gSystem_type || [];
    //sorter alfabetisk på name
    systemTypes.sort((a, b) => a.name.localeCompare(b.name));

    // Legg til systemtyper fra systemTypes
    systemTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type.rawid;
        option.textContent = type.name;
        customerSystemType.appendChild(option);
    });
   
}

function loadCustomerTypeSelector(customers) {
    const customerType = document.getElementById("customerType");
    if (!customerType) {
        console.error("Ingen 'customerType' funnet.");
        return;
    }
    // Tøm eksisterende alternativer
    customerType.innerHTML = '';
    // Legg til en tom valgmulighet
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Alle typer";
    customerType.appendChild(emptyOption);
    // Hent unike typer fra gCustomer
    const types = new Set(customers.map(customer => customer.type).filter(Boolean));
    // Legg til typer i select-elementet
    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        customerType.appendChild(option);
    });
}

function loadCategorySelector(customers) {
    const customerCategory = document.getElementById("customerCategory");
    if (!customerCategory) {
        console.error("Ingen 'customerCategory' funnet.");
        return;
    }
    // Tøm eksisterende alternativer
    customerCategory.innerHTML = '';
    // Legg til en tom valgmulighet
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Alle kategorier";
    customerCategory.appendChild(emptyOption);
    // Hent unike kategorier fra gCustomer
    const categories = new Set(customers.map(customer => customer.category).filter(Boolean));
    // Legg til kategorier i select-elementet
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        customerCategory.appendChild(option);
    });
}


function listDatainList(data) {
    // Hent containeren for leverandører
    const listContainer = document.getElementById("customerlistelement");
    if (!listContainer) {
        console.error("Ingen container funnet for visning av leverandører.");
        return;
    }

    // Tøm container
    listContainer.innerHTML = '';

    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) {
        console.error("Ingen 'elementlibrary' funnet.");
        return;
    }

    const nodeElement = elementLibrary.querySelector(".customerelement");
    if (!nodeElement) {
        console.error("Ingen '.supplier' funnet i 'elementlibrary'.");
        return;
    }

    // Sett counter
    const counter = listContainer.parentElement.querySelector(".counter");
    if (!counter) {
        console.error("Ingen '.counter' funnet i containerens forelder.");
        return;
    }
    counter.textContent = data.length + " stk.";
    counter.style.display = "block";

    data.forEach((item, index) => {
        const itemElement = nodeElement.cloneNode(true);

        // Sett navn
        const name = itemElement.querySelector('.customerlable');
        if (name) name.textContent = item.name || "Ukjent navn";
        //sett adress
        const address = itemElement.querySelector('.customeraddress');
        if (address) address.textContent = item.address || "Ukjent adresse";
      
        // Sett telefon som klikkbar lenke
        const phone = itemElement.querySelector('.customerphone');
        if (phone) {
            const number = item.phone || "Ukjent telefon";
            if (item.phone) {
                phone.innerHTML = `T: <a href="tel:${item.phone}" class="contact-link">${number}</a>`;
            } else {
                phone.textContent = `T: ${number}`;
            }
        }

        // Sett e-post som klikkbar lenke
        const email = itemElement.querySelector('.customeremail');
        if (email) {
            const mail = item.email || "Ukjent e-post";
            if (item.email) {
                email.innerHTML = `E: <a href="mailto:${item.email}" class="contact-link">${mail}</a>`;
            } else {
                email.textContent = `E: ${mail}`;
            }
        }




        //set post address
        const postAddress = itemElement.querySelector('.customerpostaddress');
        let postAddressText = item.city || "Ukjent postadresse";
        if (item.postcode && item.city) {
            postAddressText += `, ${item.postcode}`;
        }
        if (postAddress) postAddress.textContent = postAddressText;

        //list Anlegg
        listSystemInCustomer(item, itemElement);

        // Legg til klikk-event for åpning
        const button = itemElement.querySelector('.opencustomer');
        if (button) {
            button.addEventListener("click", function () {
                openCustomer(item);
            });
        }

       
        // Legg til leverandøren i containeren
        listContainer.appendChild(itemElement);
    });
}


function listSystemInCustomer(data, element) {
    const systemList = element.querySelector('.systemlist');
    if (!systemList) {
        console.error("Ingen '.systemlist' funnet.");
        return;
    }

    const systemElementLibrary = systemList.querySelector(".systemelement");
    if (!systemElementLibrary) {
        console.error("Ingen 'systemelement' funnet i 'systemlist'.");
        return;
    }

    // Sørg for at vi har en array (selv om det bare er ett system)
    const systemArray = Array.isArray(data.system) ? data.system : [data.system];

    //hvis det ikke er linket anlegg til kunde så skul foreldreelementet til systemlist og stopp prosessen
    if (systemArray.length === 0) {
        systemList.parentElement.style.display = "none"; // Skjul systemlisten
        return;
    }

    systemArray.forEach(system => {
       
        const itemElement = systemElementLibrary.cloneNode(true);
        const name = itemElement.querySelector('.systemname');
        if (name) name.textContent = system.name|| "Ukjent system";

        const modelname = itemElement.querySelector('.modelname');
        //finne modellnavn basert på system.typemodel og gSystem_type
        let modelnametext = "";
        if (system.system_type_id) {
            const typeModel = gSystem_type.find(type => type.rawid === system.system_type_id);
            if (typeModel) {
                modelnametext = typeModel.name;
            }
        }
        if (modelname) modelname.textContent = modelnametext;
        

        systemList.appendChild(itemElement);
    });

    // Fjern malen
    systemList.removeChild(systemElementLibrary);
}




