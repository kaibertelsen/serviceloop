document.getElementById('serviceForwardSelector')?.addEventListener('change', renderFilteredServiceList);
document.getElementById('serviceStatusSelector')?.addEventListener('change', renderFilteredServiceList);
document.getElementById('systemTypes')?.addEventListener('change', renderFilteredServiceList);





function renderFilteredServiceList() {
    const raw = convertDataTOServiceList(gCustomer);                   // Alle rådata
    const grouped = groupServicesByCustomerAndDate(raw);              // Slår sammen på dato + kunde
    const filtered = filterServices(grouped);                         // Bruker valgte filtre
    startServiceListPage(filtered);                                   // Viser
}



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

    //filter
    services = filterServices(services);

    //sortering på dato
  
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
        // Sett tid basert på datoen
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        timeElement.textContent = `KL ${hours}:${minutes}`;
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

      const lastservice = itemElement.querySelector('.lastservice');
      if (lastservice) {
        const lastServiceDate = system.service && system.service.length > 0 ? new Date(system.service[0].date) : new Date();
        lastservice.textContent = `Siste service: ${lastServiceDate.toLocaleDateString("no-NO", { day: '2-digit', month: 'long', year: 'numeric' })}`;
      }
  
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

function filterServices(rawServices) {
    const forwardFilter = document.getElementById("serviceForwardSelector")?.value || "";
    const statusFilter = document.getElementById("serviceStatusSelector")?.value || "";
    const typeFilter = document.getElementById("systemTypes")?.value || "";
    const now = new Date();
  
    const result = rawServices.filter(service => {
      const date = new Date(service.dato); // 👈 KUN her
  
      // Filter 1: Fremtid / fortid / hittil i år
      if (forwardFilter) {
        const days = parseInt(forwardFilter, 10);
        const date = new Date(service.dato);
      
        if (forwardFilter === "YTD") {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          if (date < startOfYear || date > now) return false;
        } else {
          const filterDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
          if (days > 0) {
            if (date > filterDate || date < now) return false; // kun mellom nå og +X dager
          }
      
          if (days < 0) {
            if (date < filterDate || date > now) return false; // kun mellom nå og -X dager
          }
        }
      }
      
  
      // Filter 2: Status
      if (statusFilter) {
        const combinedStatus = `${service.kalkuleringsstatus || ""} ${service.status || ""}`.toLowerCase();
        if (!combinedStatus.includes(statusFilter.toLowerCase())) return false;
      }
  
      // Filter 3: Systemtype
      if (typeFilter) {
        if (!service.modelname?.toLowerCase().includes(typeFilter.toLowerCase())) return false;
      }
  
      return true;
    });
  
    // Sorter på dato (nyeste først)
    result.sort((a, b) => new Date(b.dato) - new Date(a.dato));
  
    return result;
  }
  
  