var gUser = null; // Global variable to store user data
var gCustomer = []; // Global variable to store customer data
var gClient = null; // Global variable to store client data
var gService = []; // Global variable to store service data
var gSystem_type = []; // Global variable to store system data

function startup(member) {
    console.log("Startup function called with member:", member);
    // Her kan du legge til kode som skal kjøres når medlemmet er logget inn
    // For eksempel, initialisere brukergrensesnittet eller laste inn data

    //hent bruker
    GETairtable("appuUESr4s93SWaS7","tblKSc39qbkvOIsDT",member.airtable,"responsUser",false );



}

function responsUser(data) {
    //hente klientid
    gUser = data.fields;

    if(gUser?.clientid){
        //hent klient
        GETairtable("appuUESr4s93SWaS7","tblW85C7T7L6otGTp",gUser.clientid,"responsClient",false );
    }
    
}

function responsClient(data) {
    //hente teamid
    gClient = data.fields;
    gCustomer = [];
    if(gClient?.customerjson){
        gCustomer = convertCustomerJsonWithHtmlNotes(gClient.customerjson);
    }

    gSystem_type = [];
    if(gClient?.system_type){
        gSystem_type = parseItemJson(gClient.system_typejson);
    }

   
    
    //start kundelisten
    startCustomerListPage(gCustomer);

    //last inn Servicelisten
    renderFilteredServiceList(gCustomer)
    
    
}

function parseItemJson(jsonArray) {
    try {
      return jsonArray.map(item => JSON.parse(item));
    } catch (error) {
      console.error("Feil ved parsing av customerjson:", error);
      return [];
    }
}

function convertCustomerJsonWithHtmlNotes(jsonStrings) {
    return jsonStrings.map((jsonString, index) => {
      try {
        let systemNotes = [];
  
        // Først: Ekstraher `system`-arrayen
        const systemMatches = [...jsonString.matchAll(/"system":\s*\[(.*?)\](,|\})/gs)];
        if (systemMatches.length > 0) {
          let systemsRaw = systemMatches[0][1]; // Innholdet inni [ ... ]
  
          // Del opp i separate objekter (naivt, men funker hvis ikke nested)
          const systemObjects = systemsRaw.split(/\},\s*\{/).map((str, i) => {
            // Gjenoppbygg gyldig JSON for hvert objekt
            let fixed = str;
            if (!str.startsWith("{")) fixed = "{" + fixed;
            if (!str.endsWith("}")) fixed = fixed + "}";
  
            let note = '';
            const noteMatch = fixed.match(/"notes":\s*"(.*?)"(,|\})/s);
            if (noteMatch) {
              note = noteMatch[1];
              fixed = fixed.replace(/"notes":\s*".*?"(,|\})/s, '"notes":""$1');
            }
  
            return { fixedJson: fixed, note };
          });
  
          // Bytt ut hele system-arrayen med rensede versjoner i original-strengen
          const systemJsonCleaned = "[" + systemObjects.map(obj => obj.fixedJson).join(",") + "]";
          jsonString = jsonString.replace(/"system":\s*\[.*?\](,|\})/gs, `"system":${systemJsonCleaned}$1`);
          systemNotes = systemObjects.map(obj => obj.note);
        }
  
        // Parse hele kunden
        const customer = JSON.parse(jsonString);
  
        // Legg tilbake notes i system[*]
        if (customer.system && Array.isArray(customer.system)) {
          customer.system.forEach((sys, i) => {
            sys.notes = systemNotes[i] || "";
          });
        }
  
        return customer;
  
      } catch (error) {
        console.error(`Feil ved parsing av customer-json #${index}:`, error);
        return null;
      }
    }).filter(Boolean);
  }
  
  

function convertJSONArrayToObject(array) {
    let result = [];
    array.forEach(item => {
        result.push(JSON.parse(item));
    });

    return result;
}


function ruteresponse(data,id){
    if(id == "responsUser"){
        responsUser(data);
    }else if(id == "responsClient"){
        responsClient(data);
    }else if(id == "getTeamresponse"){
       
    }else if(id == "responseEditCustomer"){
        responseEditCustomer(data);
    }else if(id == "responseEditService"){
        responseEditService(data);
    }else if(id == "responseEditSystem"){
        responseEditSystem(data);
    }else if(id == "responseNewSystem"){
        responseNewSystem(data);
    }
}