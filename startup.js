var gUser = null; // Global variable to store user data


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
        gCustomer = convertJSONArrayToObject(gClient.customerjson);
    }
    
    console.log("Customer data:", gCustomer);
    
}


function convertJSONArrayToObject(array) {
    let result = [];
    array.forEach(item => {
        result.push(JSON.parse(JSON.stringify(item)));
    });

    return result;
}


function ruteresponse(data,id){
    if(id == "responsUser"){
        responsUser(data);
    }else if(id == "responsClient"){
        responsClient(data);
    }else if(id == "getTeamresponse"){
       
    }

    
}