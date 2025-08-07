var gUser = null; // Global variable to store user data
var gUsers = []; // Global variable to store users data
var gCustomer = []; // Global variable to store customer data
var gClient = null; // Global variable to store client data
var gService = []; // Global variable to store service data
var gSystem_type = []; // Global variable to store system data
var gServicetype = []; // Global variable to store service type data
var isInCustomarpage = false; // Global variable to track if in service page

const statusService = [
    { value: "", text: "Ingen status", color: "white", colorId: "8" },         // #E1E1E1 (lys grå)
    { value: "kalkulert", text: "Kalkulert", color: "gray", colorId: "8" },    // #E1E1E1 (lys grå)
    { value: "registrert", text: "Registrert", color: "#007bff", colorId: "9" },  // #5484ED (blå)
    { value: "påminnet", text: "Påminnet", color: "#17a2b8", colorId: "7" },      // #46D6DB (cyan)
    { value: "planlagt", text: "Planlagt", color: "#ffc107", colorId: "5" },     // #FBD75B (gul)
    { value: "utført", text: "Utført", color: "#28a745", colorId: "10" },        // #51B749 (grønn)
    { value: "fakturert", text: "Fakturert", color: "#000000", colorId: "8" }   //sort #000000
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
    }

    gUsers =  []; 
   if(gClient?.usersjson){
        gUsers = convertJSONArrayToObject(gClient.usersjson);
    }
    
    //start kundelisten
    startCustomerListPage(gCustomer);

    loadeUserInSelector(); // Laster inn bruker i selector

    loadServiceForwardSelector(); //Last inn perioder i service forward selector
 
}

function parseItemJson(jsonArray) {
    try {
      return jsonArray.map(item => JSON.parse(item));
    } catch (error) {
      console.error("Feil ved parsing av customerjson:", error);
      return [];
    }
}


function isValidJsonString(str) {
    if (typeof str !== "string") return false;
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  function tryFixJsonString(str) {
    // Escape " inne i HTML <a href="..."> og target="..."
    return str
      .replace(/<a href="(.*?)"/g, '<a href=\\"$1\\"')
      .replace(/ target="_blank"/g, ' target=\\"_blank\\"');
  }
  
  function parseCustomerJsonArray(jsonArray) {
    const parsedCustomers = [];
  
    jsonArray.forEach((item, index) => {
      console.log(`➡️ Behandler element ${index}, type: ${typeof item}`);
  
      if (typeof item !== "string") {
        console.warn(`⚠️ Element ${index} er ikke en streng, hopper over.`);
        return;
      }
  
      const cleanItem = item.replace(/\uFEFF/g, "");
  
      let customer;
  
      // Første forsøk: parse direkte
      if (isValidJsonString(cleanItem)) {
        try {
          customer = JSON.parse(cleanItem);
          console.log(`✅ Element ${index} parsed OK (uten fix).`);
        } catch (err) {
          console.error(`❌ Parsing-feil på index ${index} selv om valid:`, err.message);
          return;
        }
      } else {
        // Forsøk å fikse og parse på nytt
        const fixed = tryFixJsonString(cleanItem);
  
        if (isValidJsonString(fixed)) {
          try {
            customer = JSON.parse(fixed);
            console.log(`✅ Element ${index} parsed OK etter fix.`);
          } catch (err) {
            console.error(`❌ Parsing-feil etter fix på index ${index}:`, err.message);
            console.log("🔍 Item:", fixed);
            return;
          }
        } else {
          console.error(`❌ Element ${index} er ikke gyldig JSON – selv etter fix.`);
          console.log("🔍 Ugyldig item:", cleanItem);
          return;
        }
      }
  
      // Rens system og service om nødvendig
      if (Array.isArray(customer.system)) {
        customer.system.forEach(sys => {
          if (typeof sys.notes !== "string") sys.notes = sys.notes ?? "";
  
          if (Array.isArray(sys.service)) {
            sys.service.forEach(service => {
              if (typeof service.report !== "string") service.report = service.report ?? "";
              if (typeof service.note !== "string") service.note = service.note ?? "";
            });
          }
        });
      }
  
      parsedCustomers.push(customer);
    });
  
    return parsedCustomers;
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
    }else if(id == "responseDeleteService"){
        responseDeleteService(data);
    }else if(id == "responseEditService"){
        responseEditService(data);
    }else if(id == "responseNewModel"){
        responseNewModel(data);
    }else if(id == "responseFollowUp"){
        responseFollowUp(data);
    }else if(id == "responseGetServiceForDelete"){
        responseGetServiceForDelete(data);
    }else if(id == "responseNewCustomer"){
        responseNewCustomer(data);   
    }
}