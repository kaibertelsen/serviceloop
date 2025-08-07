const serviceTemplates = {
    "1": `
      <h1 style="background-color: #4a4a4a; color: white; padding: 12px; text-align: center; font-size: 24px;">
        Servicerapport – Varmeanlegg
      </h1>
  
      <h2>1. Introduksjon</h2>
      <p>
        Rapporten dokumenterer service på varmeanlegg utført den <strong>{{dato}}</strong>. Målet med servicen er å sikre effektiv drift og optimal ytelse gjennom hele fyringssesongen.
      </p>
  
      <h2>2. Kundeinformasjon</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Navn:</strong></td><td>{{kundenavn}}</td></tr>
        <tr><td><strong>Adresse:</strong></td><td>{{adresse}}</td></tr>
        <tr><td><strong>Postnummer/Sted:</strong></td><td>{{postnummer}} {{poststed}}</td></tr>
        <tr><td><strong>Telefon:</strong></td><td>{{telefon}}</td></tr>
        <tr><td><strong>E-post:</strong></td><td>{{epost}}</td></tr>
      </table>
  
      <h2>3. Systeminformasjon</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Systemnavn:</strong></td><td>{{systemnavn}}</td></tr>
        <tr><td><strong>Systemtype:</strong></td><td>{{systemTypeName}}</td></tr>
        <tr><td><strong>Serienummer:</strong></td><td>{{serienummer}}</td></tr>
        <tr><td><strong>Plassering:</strong></td><td>{{plassering}}</td></tr>
      </table>
  
      <h2>4. Utførte Oppgaver</h2>
      <ul>
        <li>Visuell inspeksjon av alle komponenter</li>
        <li>Rens av filter og varmesentral</li>
        <li>Trykktest av anlegget</li>
        <li>Sjekk av sirkulasjonspumpe og ventiler</li>
        <li>Funksjonstest og verifisering av innstillinger</li>
      </ul>
  
      <h2>5. Kommentarer</h2>
      <p><br></p>
  
      <h2>6. Utført av</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Tekniker:</strong></td><td>{{teknikernavn}}</td></tr>
        <tr><td><strong>Firma:</strong></td><td>{{firmanavn}}</td></tr>
      </table>
  
      <hr style="margin-top: 40px;">
      <p style="font-size: 12px; text-align: center; color: #666;">
        Dokumentnr: {{dokumentnr}} &nbsp;|&nbsp; Revisjon: {{revisjon}} &nbsp;|&nbsp;
        Side: 1 av 1 &nbsp;|&nbsp; Dato: {{dato}}
      </p>
    `,
  
    "2": `
      <h1 style="background-color: #4a4a4a; color: white; padding: 12px; text-align: center; font-size: 24px;">
        Servicerapport – Sanitæranlegg
      </h1>
  
      <h2>1. Introduksjon</h2>
      <p>
        Rapporten dokumenterer service på sanitæranlegg den <strong>{{dato}}</strong>. Rapporten inneholder utførte kontroller og vurdering av behov for tiltak.
      </p>
  
      <h2>2. Kundeinformasjon</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Navn:</strong></td><td>{{kundenavn}}</td></tr>
        <tr><td><strong>Adresse:</strong></td><td>{{adresse}}</td></tr>
        <tr><td><strong>Postnummer/Sted:</strong></td><td>{{postnummer}} {{poststed}}</td></tr>
        <tr><td><strong>Telefon:</strong></td><td>{{telefon}}</td></tr>
        <tr><td><strong>E-post:</strong></td><td>{{epost}}</td></tr>
      </table>
  
      <h2>3. Systeminformasjon</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Systemtype:</strong></td><td>{{systemTypeName}}</td></tr>
        <tr><td><strong>Plassering:</strong></td><td>{{plassering}}</td></tr>
      </table>
  
      <h2>4. Utførte Oppgaver</h2>
      <ul>
        <li>Inspeksjon av sanitæranlegg og synlige rør</li>
        <li>Kontroll av lekkasjer og avløp</li>
        <li>Funksjonstest av ventiler og kraner</li>
        <li>Trykktest ved behov</li>
        <li>Vurdering av videre tiltak eller vedlikehold</li>
      </ul>
  
      <h2>5. Kommentarer</h2>
      <p><br></p>
  
      <h2>6. Utført av</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Tekniker:</strong></td><td>{{teknikernavn}}</td></tr>
        <tr><td><strong>Firma:</strong></td><td>{{firmanavn}}</td></tr>
      </table>
  
      <hr style="margin-top: 40px;">
      <p style="font-size: 12px; text-align: center; color: #666;">
        Dokumentnr: {{dokumentnr}} &nbsp;|&nbsp; Revisjon: {{revisjon}} &nbsp;|&nbsp;
        Side: 1 av 1 &nbsp;|&nbsp; Dato: {{dato}}
      </p>
    `,
  
    "3": `
      <h1 style="background-color: #4a4a4a; color: white; padding: 12px; text-align: center; font-size: 24px;">
        Servicerapport – Ventilasjon
      </h1>
  
      <h2>1. Introduksjon</h2>
      <p>
        Rapporten beskriver utført service på ventilasjonssystemet den <strong>{{dato}}</strong>. Målet er å sikre god luftkvalitet, energieffektivitet og driftssikkerhet.
      </p>
  
      <h2>2. Kundeinformasjon</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Navn:</strong></td><td>{{kundenavn}}</td></tr>
        <tr><td><strong>Adresse:</strong></td><td>{{adresse}}</td></tr>
        <tr><td><strong>Postnummer/Sted:</strong></td><td>{{postnummer}} {{poststed}}</td></tr>
        <tr><td><strong>Telefon:</strong></td><td>{{telefon}}</td></tr>
        <tr><td><strong>E-post:</strong></td><td>{{epost}}</td></tr>
      </table>
  
      <h2>3. Systeminformasjon</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Systemnavn:</strong></td><td>{{systemnavn}}</td></tr>
        <tr><td><strong>Systemtype:</strong></td><td>{{systemTypeName}}</td></tr>
        <tr><td><strong>Serienummer:</strong></td><td>{{serienummer}}</td></tr>
        <tr><td><strong>Plassering:</strong></td><td>{{plassering}}</td></tr>
      </table>
  
      <h2>4. Utførte Oppgaver</h2>
      <ul>
        <li>Filterbytte og rens av inntak/avkast</li>
        <li>Test av vifter og elektronikk</li>
        <li>Måling av luftmengder og tilpasning</li>
        <li>Kontroll av aggregat og kanalsystem</li>
        <li>Feilretting og vedlikeholdstiltak ved behov</li>
      </ul>
  
      <h2>5. Kommentarer</h2>
      <p><br></p>
  
      <h2>6. Utført av</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><strong>Tekniker:</strong></td><td>{{teknikernavn}}</td></tr>
        <tr><td><strong>Firma:</strong></td><td>{{firmanavn}}</td></tr>
      </table>
  
      <hr style="margin-top: 40px;">
      <p style="font-size: 12px; text-align: center; color: #666;">
        Dokumentnr: {{dokumentnr}} &nbsp;|&nbsp; Revisjon: {{revisjon}} &nbsp;|&nbsp;
        Side: 1 av 1 &nbsp;|&nbsp; Dato: {{dato}}
      </p>
    `
  }
  
  
  

function loadHtmlTemplateToQuill(htmlTemplate, data, quillInstance) {
if (!quillInstance || typeof quillInstance.setContents !== 'function') {
    console.error("❌ Ugyldig Quill-instans");
    return;
}

const filledHtml = htmlTemplate.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();
    return data[trimmedKey] != null ? data[trimmedKey] : "";
});

quillInstance.root.innerHTML = filledHtml;
}
  