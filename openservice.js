

document.getElementById("fromServicetoCustomer").addEventListener("click", function () {
   
      // Trykk på faneknappen
    const customerTabButton = document.getElementById("customertabbutton");
    if (customerTabButton) customerTabButton.click();

});


function listServiceOnsystem(itemElement, item, customer) {

      //list opp servicer
      const serviceListContainer = itemElement.querySelector(".serviceelementlist");
      serviceListContainer.innerHTML = ''; // Tøm containeren
      if (!item.service || item.service.length === 0) {
        serviceListContainer.textContent = "Ingen service funnet for dette systemet.";
        return;
      }
      // Hent mal for serviceelement
      const elementLibrary = document.getElementById("elementlibrary");
      const serviceElementTemplate = elementLibrary.querySelector(".servicerow");
      if (!serviceElementTemplate) {
        console.error("Ingen '.serviceelement' funnet i 'elementlibrary'.");
        return;
      }
      // Sorter service etter dato
      item.service.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      item.service.forEach((service) => {

        const serviceElement = serviceElementTemplate.cloneNode(true);

        //sette dato
        const dateInput = serviceElement.querySelector(".servicedate");

        if (service.date) {
        const d = new Date(service.date);
        // Formatér til YYYY-MM-DDTHH:mm
        const formatted =
            d.toISOString().slice(0, 16); // "2025-06-01T00:00"
        dateInput.value = formatted;
        } else {
        dateInput.value = "";
        }
        
        //Load status selectoren med arrayen statusService
        const statusSelect = serviceElement.querySelector(".editstatusservice");
        if (statusSelect) {
          statusSelect.innerHTML = ''; // Tøm select-elementet
          statusService.forEach(status => {
            const option = document.createElement("option");
            option.value = status.value;
            option.textContent = status.text;
            //gjøre begge om til lowercase for å sammenligne
            if (service.status && status.value && service.status.toLowerCase() === status.value.toLowerCase()) {
              option.selected = true; // Marker som valgt hvis det samsvarer med tjenestens status
            }

            //hvis status er fakturert
            if (status.value === "fakturert" || status.value === "Fakturert") {
              option.disabled = true; // Deaktiver alternativet hvis status er fakturert
            }
            
            statusSelect.appendChild(option);
          });
        }

        //loade edittypeservice med gServicetype
        const typeSelect = serviceElement.querySelector(".edittypeservice");
        if (typeSelect) {
          typeSelect.innerHTML = ''; // Tøm select-elementet
          gServicetype.forEach(type => {
            const option = document.createElement("option");
            option.value = type.rawid; // Bruk rawid som value
            option.textContent = type.name;
            //gjøre begge om til lowercase for å sammenligne
            if (service.type && type.rawid && service.type.toLowerCase() === type.rawid.toLowerCase()) {
              option.selected = true; // Marker som valgt hvis det samsvarer med tjenestens type
            }
            typeSelect.appendChild(option);
          });
        }

        //loade edituserservice med gUsers
        const userSelect = serviceElement.querySelector(".edituserservice");
        if (userSelect) {
          userSelect.innerHTML = ''; // Tøm select-elementet
          gUsers.forEach(user => {
            const option = document.createElement("option");
            option.value = user.rawid; // Bruk brukerens ID som value
            option.textContent = user.name;
            //gjøre begge om til lowercase for å sammenligne
            if (service.user && user.rawid && service.user.toLowerCase() === user.rawid.toLowerCase()) {
              option.selected = true; // Marker som valgt hvis det samsvarer med tjenestens bruker
            }
            userSelect.appendChild(option);
          });
        } 

        
        // Legg til redigeringsfunksjonalitet
        serviceElement.querySelector(".openservicebutton").addEventListener("click", () => {
          
        });

        serviceListContainer.appendChild(serviceElement);
      });
}