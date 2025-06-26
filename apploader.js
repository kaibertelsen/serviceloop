function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(`Failed to load script: ${url}`);
        document.head.appendChild(script);
    });
}

// Liste over CDN-URL-er som skal lastes inn
const cdnScripts = [
    "https://kaibertelsen.github.io/serviceloop/startup.js",
    "https://kaibertelsen.github.io/serviceloop/customerlistpage.js",
    "https://kaibertelsen.github.io/serviceloop/servicelistpage.js",
    "https://kaibertelsen.github.io/serviceloop/opencustomer.js",
    "https://kaibertelsen.github.io/serviceloop/openservice.js",
    "https://kaibertelsen.github.io/serviceloop/opensystem.js",
    "https://kaibertelsen.github.io/serviceloop/apicom.js"

];

// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
    MemberStack.onReady.then(function(member) {
        
        if (member.loggedIn){
            console.log("Member is logged in");
            const listpagetabbutton = document.getElementById("listpagetabbutton");
            //listpagetabbutton.click();
            startup(member);

        }else{
            //gå til innloggingsside https://serviceloop.webflow.io/login
            console.log("Member is not logged in");
            window.location.href = "https://serviceloop.webflow.io/login";

        }

    });

}).catch(error => {
    console.error(error);
});