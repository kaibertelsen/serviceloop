document.getElementById('serviceForwardSelector')?.addEventListener('change', renderFilteredServiceList);
document.getElementById('serviceStatusSelector')?.addEventListener('change', renderFilteredServiceList);
document.getElementById('userOnServiceSelector')?.addEventListener('change', renderFilteredServiceList);
document.getElementById('systemTypes')?.addEventListener('change', renderFilteredServiceList);


document.getElementById('servicelisttabbutton')?.addEventListener('click', function() {
  isInCustomarpage = false; // Set global variable to false
 renderFilteredServiceList();
});




function renderFilteredServiceList() {

    loadeUserInSelector(); // Laster inn bruker i selector


   // const raw = convertDataTOServiceList(gCustomer);                   // Alle rådata
   // const grouped = groupServicesByCustomerAndDate(raw);   
     var servicelist = getAllServicesFromCustomers(gCustomer)  ;        // Slår sammen på dato + kunde
    const filtered = filterServices(servicelist);                       // Bruker valgte filtre
    //filtrer vekk alle med "kalkulert" status
    const nonCalculated = filtered.filter(service => service.status.toLowerCase() !== "kalkulert");
    startServiceListPage(nonCalculated);                                   // Viser
}
function loadeUserInSelector() {
    const userSelector = document.getElementById("userOnServiceSelector");
    if (!userSelector) return console.error("Ingen 'userSelector' funnet.");

    userSelector.innerHTML = ''; // Tømmer eksisterende innhold

    //en Velg bruker med value "" som ligger først i listen
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Velg bruker";
    userSelector.appendChild(defaultOption);

    //sorter bruker etter Navn
    const sortedUser = gUsers.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
    }
    );

    sortedUser.forEach(user => {
        const option = document.createElement("option");
        option.value = user.rawid;
        option.textContent = user.name || "Ukjent bruker";
        userSelector.appendChild(option);
    });
}

function startServiceListPage(services) {
    const listContainer = document.getElementById("servicelistelement");
    if (!listContainer) return console.error("Ingen container funnet.");
  
    listContainer.innerHTML = '';
  
    const elementLibrary = document.getElementById("elementlibrary");
    if (!elementLibrary) return console.error("Ingen 'elementlibrary' funnet.");
    const serviceElementTemplate = elementLibrary.querySelector(".servicerow");
    const servicecalcElement = elementLibrary.querySelector(".servicecalc");
  
    const nodeElement = elementLibrary.querySelector(".serviceelement");
    if (!nodeElement) return console.error("Ingen '.serviceelement' i biblioteket.");
  
    const counter = listContainer.parentElement.querySelector(".counter");
    if (counter) {
      counter.textContent = `${services.length} stk.`;
      counter.style.display = "block";
    }
  
    // Filter
    services = filterServices(services);
  
    services.forEach(service => {

      let serviceElement = makeServiceElement(service, listContainer, null, null, serviceElementTemplate, servicecalcElement,true);
      listContainer.appendChild(serviceElement);
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

      const followupinfo = itemElement.querySelector('.followupinfo');
      //Hvis dato for oppfølginger 20.01.2025 , 30.01.2025 osv..
        if (followupinfo) {
            const followups = system.service && system.service.length > 0 ? system.service[0].followup : [];
            if (Array.isArray(followups) && followups.length > 0) {
                const followupDates = followups.map(f => new Date(f.date).toLocaleDateString("no-NO", { day: '2-digit', month: 'long', year: 'numeric' }));
                followupinfo.textContent = `Oppfølginger: ${followupDates.join(', ')}`;
            } else {
                followupinfo.textContent = "";
                followupinfo.style.display = "none"; // Skjul hvis ingen oppfølginger
            }
        }
  
      

      systemList.appendChild(serviceElement);
    });
  
    systemList.removeChild(systemElementLibrary); // fjern mal
}
  
function convertDataTOServiceList(customers) {
    const serviceList = [];
    const today = new Date();
  
    customers.forEach(customer => {
      const { name, address, postcode, city, system } = customer;
  
      if (Array.isArray(system)) {
        system.forEach(sys => {
          let intervall = parseInt(sys.intervall, 10);
          if (isNaN(intervall) || intervall <= 0) intervall = 12;
  
          const model = sys.typemodel || "Ukjent modell";
          const systemName = sys.name || "Ukjent anlegg";
  
          // Registrerte servicer
          if (Array.isArray(sys.service)) {
            sys.service.forEach(service => {
              const date = new Date(service.date);
              const lowerStatus = (service.status || "").toLowerCase();
              const hasFollowup = Array.isArray(service.followup) && service.followup.length > 0;
  
              let status = "Registrert";
              if (lowerStatus === "fakturert") {
                status = "Fakturert";
              } else if (lowerStatus === "utført") {
                status = "Utført";
              } else if (lowerStatus === "planlagt" || date > today) {
                status = "Planlagt";
              } else if (hasFollowup) {
                status = "Påminnet";
              }
  
              serviceList.push({
                dato: date.toISOString(),
                status: status,
                customername: name,
                address: address,
                poststed: `${postcode} ${city}`,
                systemname: systemName,
                modelname: model,
                sendt_påminnelse: hasFollowup ? "Ja" : "Nei",
                system: [sys]
              });
            });
          }
  
          // Kalkulert neste service
          if (sys.installed_date) {
            const installDate = new Date(sys.installed_date);
            let monthsToAdd = 0;
  
            while (
              new Date(
                installDate.getFullYear(),
                installDate.getMonth() + monthsToAdd,
                installDate.getDate()
              ) <= today
            ) {
              monthsToAdd += intervall;
            }
  
            const nextService = new Date(
              installDate.getFullYear(),
              installDate.getMonth() + monthsToAdd,
              installDate.getDate()
            );
  
            serviceList.push({
              dato: nextService.toISOString(),
              status: "Kalkulert",
              customername: name,
              address: address,
              poststed: `${postcode} ${city}`,
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

function getAllServicesFromCustomers(customers) {
  const allServices = [];

  customers.forEach(customer => {
      const systems = Array.isArray(customer.system) ? customer.system : [];

      systems.forEach(system => {
          const services = Array.isArray(system.service) ? system.service : [];

          services.forEach(service => {
              allServices.push({
                  ...service,
                  customerName: customer.name,
                  customerId: customer.rawid,
                  systemName: system.name,
                  systemId: system.rawid
              });
          });
      });
  });

  return allServices;
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
    const statusFilter = document.getElementById("serviceStatusSelector")?.value.toLowerCase() || "";
    const typeFilter = document.getElementById("systemTypes")?.value.toLowerCase() || "";
    const userFilter = document.getElementById("userOnServiceSelector")?.value || "";

    const now = new Date();
  
    const result = rawServices.filter(service => {
      const date = new Date(service.dato);
  
      // === Filter 1: Fremtid / fortid / hittil i år ===
      if (forwardFilter) {
        if (forwardFilter === "YTD") {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          if (date < startOfYear || date > now) return false;
        } else {
          const days = parseInt(forwardFilter, 10);
          const filterDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
          if (days > 0 && (date < now || date > filterDate)) return false;
          if (days < 0 && (date > now || date < filterDate)) return false;
        }
      }
  
      // === Filter 2: Status ===
      if (statusFilter) {
        const serviceStatus = (service.status || "").toLowerCase();
        if (serviceStatus !== statusFilter) return false;
      }
  
      // === Filter 3: Systemtype ===
      if (typeFilter) {
        const model = (service.modelname || "").toLowerCase();
        if (!model.includes(typeFilter)) return false;
      }

      // === Filter 4: Bruker ===
      if (userFilter) {
        const userOnService = service.user || "";
        if (userOnService !== userFilter) return false;
      }
  
      return true;
    });
  
    // Sorter nyeste øverst
    result.sort((a, b) => new Date(b.dato) - new Date(a.dato));
  
    return result;
}
  
  
