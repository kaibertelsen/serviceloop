function openCustomer(customer) {
    // Trykk på faneknappen for kunden
    const customerTabButton = document.getElementById("customertabbutton");
    if (customerTabButton) customerTabButton.click();

    // Fyll inn data i tekstfeltene
    document.querySelector(".customernummberlable").textContent = "Kundenummer: " + (customer.type || "–");
    document.querySelector(".customerlablename").textContent = "Kundenavn: " + (customer.name || "–");
    document.querySelector(".adresslable").textContent = "Adresse: " + (customer.address || "–");

    const postAndCity = [customer.postcode, customer.city].filter(Boolean).join(" ");
    document.querySelector(".postlable").textContent = "Postkode og sted: " + (postAndCity || "–");

    const emailContainer = document.querySelector(".emaillable");
    if (customer.email) {
        emailContainer.innerHTML = `E-post: <a href="mailto:${customer.email}">${customer.email}</a>`;
    } else {
        emailContainer.textContent = "E-post: –";
    }
}
