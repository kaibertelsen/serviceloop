
function startServiceListPage(services) {
    const listContainer = document.getElementById("servicelistelement");
    if (!listContainer) return console.error("Ingen container funnet.");
  
    listContainer.innerHTML = '';
  
    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) return console.error("Ingen 'elementlibrary' funnet.");
  
    const nodeElement = elementLibrary.querySelector(".serviceelement");
    if (!nodeElement) return console.error("Ingen '.serviceelement' i biblioteket.");
  
    const counter = listContainer.parentElement.querySelector(".counter");
    if (counter) {
      counter.textContent = `${services.length} stk.`;
      counter.style.display = "block";
    }
  
    services.forEach((item, index) => {
      const itemElement = nodeElement.cloneNode(true);
  
      // Dato og tid
      const date = new Date(item.dato);
      const dateElement = itemElement.querySelector('.datelable');
      if (dateElement) {
        dateElement.textContent = date.toLocaleDateString("no-NO", { day: '2-digit', month: 'long', year: 'numeric' });
      }
  
      const timeElement = itemElement.querySelector('.timeelement');
      if (timeElement) {
        timeElement.textContent = "KL 15:15";
      }
  
      // Status
      const statusElement = itemElement.querySelector('.statuselement');
      if (statusElement) {
        statusElement.textContent = item.status || "Ukjent status";
        statusElement.className = `servicestatus ${item.status ? item.status.toLowerCase() : "unknown"}`;
      }
  
      // Kundenavn
      const name = itemElement.querySelector('.customerlable');
      if (name) name.textContent = item.customername || "Ukjent navn";
  
      // Systemnavn
      const systemName = itemElement.querySelector('.systemname');
      if (systemName) systemName.textContent = item.systemname || "Ukjent anlegg";
  
      // Modellnavn
      const modelname = itemElement.querySelector('.modelname');
      if (modelname) modelname.textContent = item.modelname || "Ukjent modell";
  
      // Klikk for å åpne detaljer
      const button = itemElement.querySelector('.openservice');
      if (button) {
        button.addEventListener("click", () => openService(item));
      }
  
      listContainer.appendChild(itemElement);
    });
  }
  



function convertDataTOServiceList(customers) {
    const serviceList = [];
  
    customers.forEach(customer => {
      const { name, address, postcode, city, system } = customer;
  
      if (Array.isArray(system)) {
        system.forEach(sys => {
          const intervall = parseInt(sys.intervall || "12", 10);
          const model = sys.typemodel || "Ukjent modell";
          const systemName = sys.name || "Ukjent anlegg";
  
          // 1. Legg til registrerte servicer
          if (Array.isArray(sys.service)) {
            sys.service.forEach(service => {
              const date = new Date(service.date);
              serviceList.push({
                dato: date.toISOString(),
                status: service.status || "Ukjent",
                customername: name,
                address: address,
                poststed: `${postcode} ${city}`,
                kalkuleringsstatus: "Registrert",
                systemname: systemName,
                modelname: model,
                sendt_påminnelse: "Nei"
              });
            });
          }
  
          // 2. Beregn neste service basert på installasjonsdato og intervall
          if (sys.installed_date) {
            const installDate = new Date(sys.installed_date);
            const today = new Date();
            let monthsToAdd = 0;
  
            while (new Date(installDate.getFullYear(), installDate.getMonth() + monthsToAdd, installDate.getDate()) <= today) {
              monthsToAdd += intervall;
            }
  
            const nextService = new Date(installDate.getFullYear(), installDate.getMonth() + monthsToAdd, installDate.getDate());
  
            serviceList.push({
              dato: nextService.toISOString(),
              status: "Ikke registrert",
              customername: name,
              address: address,
              poststed: `${postcode} ${city}`,
              kalkuleringsstatus: "Beregnet",
              systemname: systemName,
              modelname: model,
              sendt_påminnelse: "Nei"
            });
          }
        });
      }
    });
  
    return serviceList;
  }
  
  