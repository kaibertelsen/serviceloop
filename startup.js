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
        gCustomer = parseItemJson(gClient.customerjson);
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
    if (!Array.isArray(jsonArray)) return [];
  
    return jsonArray.map(item => {
      const parsedItem = {};
  
      for (const key in item) {
        if (key === "notes") {
          if (typeof item.notes === "string") {
            parsedItem.notes = item.notes;
          } else if (item.notes == null) {
            parsedItem.notes = "";
          } else {
            parsedItem.notes = JSON.stringify(item.notes, null, 2); // Behold struktur og linjeskift
          }
        } else {
          parsedItem[key] = item[key];
        }
      }
  
      return parsedItem;
    });
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
    }
    
}