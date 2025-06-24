

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
        serviceElement.querySelector(".servicedate").value = service.date ? formatDate(new Date(service.date)) : "–";
        
        //Load status selectoren med arrayen statusService
        const statusSelect = serviceElement.querySelector(".editstatusservice");
        if (statusSelect) {
          statusSelect.innerHTML = ''; // Tøm select-elementet
          statusService.forEach(status => {
            const option = document.createElement("option");
            option.value = status.value;
            option.textContent = status.text;
            if (service.status === status.value) {
              option.selected = true; // Marker som valgt hvis det samsvarer med tjenestens status
            }
            statusSelect.appendChild(option);
          });
        }

        
        // Legg til redigeringsfunksjonalitet
        serviceElement.querySelector(".openservicebutton").addEventListener("click", () => {
          
        });

        serviceListContainer.appendChild(serviceElement);
      });
}