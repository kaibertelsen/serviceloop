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
        gCustomer = parseCustomerJsonArray(gClient.customerjson);
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

function parseCustomerJsonArray(jsonArray) {
    return jsonArray.map((jsonString, index) => {
      try {
        let customer;
  
        // 🔍 Hvis det starter med '"{' og slutter med '}"', er det dobbel-encoded JSON
        if (
          typeof jsonString === "string" &&
          jsonString.trim().startsWith('"{"') &&
          jsonString.trim().endsWith('}"')
        ) {
          customer = JSON.parse(JSON.parse(jsonString));
        } else {
          customer = JSON.parse(jsonString);
        }
  
        // 🔧 Sikre at alle notes er strenger
        if (Array.isArray(customer.system)) {
          customer.system.forEach(sys => {
            if (typeof sys.notes !== "string") {
              sys.notes = sys.notes == null ? "" : String(sys.notes);
            }
          });
        }
  
        return customer;
      } catch (err) {
        console.warn(`❌ Parsing-feil på index ${index}:`, err);
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
    }else if(id == "responseDeleteSystem"){
        responseDeleteSystem(data);
    }
}