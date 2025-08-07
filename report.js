const serviceTemplates = {
    "1": `
      <h2 style="color: #333;">Servicerapport – Varmeanlegg</h2>
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3 style="margin-top: 20px;">Kundeinformasjon</h3>
      <p>
        <strong>Navn:</strong> {{kundenavn}}<br>
        <strong>Adresse:</strong> {{adresse}}, {{postnummer}} {{poststed}}<br>
        <strong>Telefon:</strong> {{telefon}}<br>
        <strong>E-post:</strong> {{epost}}
      </p>
  
      <h3 style="margin-top: 20px;">Systeminformasjon</h3>
      <p>
        <strong>Systemnavn:</strong> {{systemnavn}}<br>
        <strong>Systemtype:</strong> {{systemTypeName}}<br>
        <strong>Serienummer:</strong> {{serienummer}}<br>
        <strong>Plassering:</strong> {{plassering}}
      </p>
  
      <h3 style="margin-top: 20px;">Utførte oppgaver</h3>
      <ol>
        <li>Visuell kontroll av varmeanlegg</li>
        <li>Rens av filter og varmeveksler</li>
        <li>Trykktest og lekkasjekontroll</li>
        <li>Sjekk av sirkulasjon og ventiler</li>
        <li>Funksjonstest og innstillinger</li>
      </ol>
  
      <h3 style="margin-top: 20px;">Utført av</h3>
      <p><strong>Tekniker:</strong> {{teknikernavn}}</p>
    `,
  
    "2": `
      <h2 style="color: #333;">Servicerapport – Sanitæranlegg</h2>
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3 style="margin-top: 20px;">Kundeinformasjon</h3>
      <p>
        <strong>Navn:</strong> {{kundenavn}}<br>
        <strong>Adresse:</strong> {{adresse}}, {{postnummer}} {{poststed}}<br>
        <strong>Telefon:</strong> {{telefon}}<br>
        <strong>E-post:</strong> {{epost}}
      </p>
  
      <h3 style="margin-top: 20px;">Systeminformasjon</h3>
      <p>
        <strong>Systemtype:</strong> {{systemTypeName}}<br>
        <strong>Plassering:</strong> {{plassering}}
      </p>
  
      <h3 style="margin-top: 20px;">Utførte oppgaver</h3>
      <ol>
        <li>Inspeksjon av sanitæranlegg og rørføringer</li>
        <li>Kontroll av lekkasjer og trykk</li>
        <li>Funksjonstest av ventiler og kraner</li>
        <li>Rens av sluk og avløp ved behov</li>
        <li>Eventuelle tilpasninger eller anbefalinger</li>
      </ol>
  
      <h3 style="margin-top: 20px;">Utført av</h3>
      <p><strong>Tekniker:</strong> {{teknikernavn}}</p>
    `,
  
    "3": `
      <h2 style="color: #333;">Servicerapport – Ventilasjon</h2>
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3 style="margin-top: 20px;">Kundeinformasjon</h3>
      <p>
        <strong>Navn:</strong> {{kundenavn}}<br>
        <strong>Adresse:</strong> {{adresse}}, {{postnummer}} {{poststed}}<br>
        <strong>Telefon:</strong> {{telefon}}<br>
        <strong>E-post:</strong> {{epost}}
      </p>
  
      <h3 style="margin-top: 20px;">Systeminformasjon</h3>
      <p>
        <strong>Systemnavn:</strong> {{systemnavn}}<br>
        <strong>Systemtype:</strong> {{systemTypeName}}<br>
        <strong>Serienummer:</strong> {{serienummer}}<br>
        <strong>Plassering:</strong> {{plassering}}
      </p>
  
      <h3 style="margin-top: 20px;">Utførte oppgaver</h3>
      <ol>
        <li>Filterbytte og rens av luftinntak og avkast</li>
        <li>Kontroll av aggregat og viftesystem</li>
        <li>Måling og justering av luftmengder</li>
        <li>Inspeksjon av kanalsystem og ventiler</li>
        <li>Funksjonstest og feilretting ved behov</li>
      </ol>
  
      <h3 style="margin-top: 20px;">Utført av</h3>
      <p><strong>Tekniker:</strong> {{teknikernavn}}</p>
    `
  };
  
  
  
  
  

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
  