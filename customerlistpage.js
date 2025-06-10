
function startCustomerListPage(customers) {
    // Initialize the customer list page
    listCustomers(customers);
   
}


function listCustomers(customers) {
  

    //filtrer på kategori



    //filtrer på søkeord



    // Sorter kundene etter navn



    //lag liste
    listDatainList(customers);


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
                phone.innerHTML = `<a href="tel:${item.phone}">${number}</a>`;
            } else {
                phone.textContent = number;
            }
        }

        // Sett e-post som klikkbar lenke
        const email = itemElement.querySelector('.customeremail');
        if (email) {
            const mail = item.email || "Ukjent e-post";
            if (item.email) {
                email.innerHTML = `<a href="mailto:${item.email}">${mail}</a>`;
            } else {
                email.textContent = mail;
            }
        }






        //set post address
        const postAddress = itemElement.querySelector('.customerpostaddress');
        let postAddressText = item.postaddress || "Ukjent postadresse";
        if (item.postcode && item.postaddress) {
            postAddressText += `, ${item.postcode}`;
        }
        if (postAddress) postAddress.textContent = postAddressText;

        //list Anlegg
        console.log("Anlegg:", item.system);

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