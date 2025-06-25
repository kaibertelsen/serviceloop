var gUser = null; // Global variable to store user data
var gUsers = []; // Global variable to store users data
var gCustomer = []; // Global variable to store customer data
var gClient = null; // Global variable to store client data
var gService = []; // Global variable to store service data
var gSystem_type = []; // Global variable to store system data
var gServicetype = []; // Global variable to store service type data

const statusService = [
    { value: "", text: "Alle statuser" },
    { value: "registrert", text: "Registrert" },
    { value: "påminnet", text: "Påminnet" },
    { value: "planlagt", text: "Planlagt" },
    { value: "utført", text: "Utført" },
    { value: "fakturert", text: "Fakturert" }
];



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

    gServicetype = [];
    if(gClient?.service_typejson){
        gServicetype = parseItemJson(gClient.service_typejson);
        //sorter alfabetisk
        gServicetype.sort((a, b) => a.name.localeCompare(b.name));
    }

    gUsers =  []; 
   if(gClient?.usersjson){
        gUsers = convertJSONArrayToObject(gClient.usersjson);
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
        // Fjern evt. Byte Order Mark (BOM) og usynlige tegn
        jsonString = jsonString.replace(/\uFEFF/g, "");
  
        const customer = JSON.parse(jsonString);
  
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
    }else if(id == "responseNewService"){
        responseNewService(data);
    }
}