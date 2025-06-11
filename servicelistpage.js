
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
  
    services.forEach(item => {
      const itemElement = nodeElement.cloneNode(true);
  
      const date = new Date(item.dato);
      const dateElement = itemElement.querySelector('.datelable');
      if (dateElement) {
        dateElement.textContent = date.toLocaleDateString("no-NO", {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
      }
  
      const timeElement = itemElement.querySelector('.timeelement');
      if (timeElement) {
        timeElement.textContent = "KL 15:15";
      }
  
      const statusElement = itemElement.querySelector('.statuselement');
      if (statusElement) {
        statusElement.textContent = item.status || "Ukjent status";
        statusElement.className = `servicestatus ${item.status ? item.status.toLowerCase() : "unknown"}`;
      }
  
      const colorElement = itemElement.querySelector('.colorstatus');
      if (colorElement) {
        if (item.kalkuleringsstatus === "Beregnet") {
          colorElement.style.backgroundColor = "#ffcc00";
        } else if (item.kalkuleringsstatus === "Registrert") {
          colorElement.style.backgroundColor = "#00cc66";
        } else {
          colorElement.style.backgroundColor = "#cccccc";
        }
      }
  
      const name = itemElement.querySelector('.customerlable');
      if (name) name.textContent = item.customername || "Ukjent navn";
  
      listSystemInService(item, itemElement);
  
      const button = itemElement.querySelector('.openservice');
      if (button) {
        button.addEventListener("click", () => openService(item));
      }
  
      listContainer.appendChild(itemElement);
    });
}
  
function listSystemInService(data, element) {
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
  
    const systemArray = Array.isArray(data.system) ? data.system : [data.system];
  
    if (!systemArray || systemArray.length === 0) {
      systemList.parentElement.style.display = "none";
      return;
    }
  
    systemArray.forEach(system => {
      const itemElement = systemElementLibrary.cloneNode(true);
  
      const name = itemElement.querySelector('.systemname');
      if (name) name.textContent = system.name || "Ukjent system";
  
      const modelname = itemElement.querySelector('.modelname');
      if (modelname) modelname.textContent = system.typemodel || "";
  
      systemList.appendChild(itemElement);
    });
  
    systemList.removeChild(systemElementLibrary); // fjern mal
}
  
function convertDataTOServiceList(customers) {
    const serviceList = [];
  
    customers.forEach(customer => {
      const { name, address, postcode, city, system } = customer;
  
      if (Array.isArray(system)) {
        system.forEach(sys => {
          let intervall = parseInt(sys.intervall, 10);
          if (isNaN(intervall) || intervall <= 0) intervall = 12;
  
          const model = sys.typemodel || "Ukjent modell";
          const systemName = sys.name || "Ukjent anlegg";
  
          // 1. Registrerte servicer
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
                sendt_påminnelse: "Nei",
                system: [sys]
              });
            });
          }
  
          // 2. Beregnet neste service
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
              sendt_påminnelse: "Nei",
              system: [sys]
            });
          }
        });
      }
    });
  
    return serviceList;
}
  
function groupServicesByCustomerAndDate(services) {
    const grouped = {};
  
    services.forEach(service => {
      const key = `${service.customername}_${service.dato}`;
  
      if (!grouped[key]) {
        grouped[key] = {
          ...service,
          system: [...(service.system || [])]
        };
      } else {
        grouped[key].system.push(...(service.system || []));
      }
    });
  
    return Object.values(grouped);
}

