document.getElementById("elementlibrary").style.display = "none"; // Skjul elementbiblioteket


function startCustomerListPage(customers) {
    // Initialize the customer list page
    listCustomers(customers);
   
}

document.getElementById("customerCategory").addEventListener("change", () => listCustomers(gCustomer));
document.getElementById("customerSystemType").addEventListener("change", () => listCustomers(gCustomer));
document.getElementById("customerSearchfield").addEventListener("input", () => listCustomers(gCustomer));



function listCustomers(customers) {
    const categorySelector = document.getElementById("customerCategory");
    const searchInput = document.getElementById("customerSearchfield");
    const systemSelector = document.getElementById("customerSystemType");

    const selectedCategory = categorySelector ? categorySelector.value.trim().toLowerCase() : "";
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedSystem = systemSelector ? systemSelector.value.trim().toLowerCase() : "";

    const filtered = customers.filter(customer => {
        const name = (customer.name || "").toLowerCase();
        const category = (customer.category || "").toLowerCase();
        const systems = Array.isArray(customer.system) ? customer.system : [customer.system];

        const matchesCategory = selectedCategory === "" || category === selectedCategory;
        const matchesSearch = searchTerm === "" || name.includes(searchTerm);
        const matchesSystem = selectedSystem === "" || systems.some(sys => {
            const sysName = typeof sys === "string" ? sys.toLowerCase() : (sys.name || "").toLowerCase();
            return sysName.includes(selectedSystem);
        });

        return matchesCategory && matchesSearch && matchesSystem;
    });

    // Sorter alfabetisk
    filtered.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    listDatainList(filtered);
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
        if (modelname) modelname.textContent = system.typemodel || "";

        systemList.appendChild(itemElement);
    });

    // Fjern malen
    systemList.removeChild(systemElementLibrary);
}




