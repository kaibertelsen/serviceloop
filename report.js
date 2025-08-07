const serviceTemplates = {
    "1": `
      <h2>Servicerapport – Varmeanlegg</h2>
  
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3>Kundeinformasjon</h3>
      <p>
        <strong>Navn:</strong> {{kundenavn}}<br>
        <strong>Adresse:</strong> {{adresse}}, {{postnummer}} {{poststed}}<br>
        <strong>Telefon:</strong> {{telefon}}<br>
        <strong>E-post:</strong> {{epost}}
      </p>
  
      <h3>Systeminformasjon</h3>
      <p>
        <strong>Systemnavn:</strong> {{systemnavn}}<br>
        <strong>Systemtype:</strong> {{systemTypeName}}<br>
        <strong>Serienummer:</strong> {{serienummer}}<br>
        <strong>Plassering:</strong> {{plassering}}
      </p>
  
      <h3>Utførte oppgaver</h3>
      <ul>
        <li>Visuell inspeksjon av komponenter</li>
        <li>Rens av filter og varmesentral</li>
        <li>Trykktest og lekkasjekontroll</li>
        <li>Funksjonstest og justering</li>
      </ul>
  
      <h3>Kommentarer</h3>
      <p>{{kommentarer}}</p>
  
      <h3>Utført av</h3>
      <p>
        <strong>Tekniker:</strong> {{teknikernavn}}<br>
        <strong>Firma:</strong> {{firmanavn}}<br>
        <strong>Dokumentnr:</strong> {{dokumentnr}}<br>
        <strong>Revisjon:</strong> {{revisjon}}
      </p>
    `,
  
    "2": `
      <h2>Servicerapport – Sanitæranlegg</h2>
  
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3>Kundeinformasjon</h3>
      <p>
        <strong>Navn:</strong> {{kundenavn}}<br>
        <strong>Adresse:</strong> {{adresse}}, {{postnummer}} {{poststed}}<br>
        <strong>Telefon:</strong> {{telefon}}<br>
        <strong>E-post:</strong> {{epost}}
      </p>
  
      <h3>Systeminformasjon</h3>
      <p>
        <strong>Systemtype:</strong> {{systemTypeName}}<br>
        <strong>Plassering:</strong> {{plassering}}
      </p>
  
      <h3>Utførte oppgaver</h3>
      <ul>
        <li>Inspeksjon av rør og komponenter</li>
        <li>Kontroll for lekkasjer</li>
        <li>Test av ventiler og kraner</li>
        <li>Funksjonstest og dokumentasjon</li>
      </ul>
  
      <h3>Kommentarer</h3>
      <p>{{kommentarer}}</p>
  
      <h3>Utført av</h3>
      <p>
        <strong>Tekniker:</strong> {{teknikernavn}}<br>
        <strong>Firma:</strong> {{firmanavn}}<br>
        <strong>Dokumentnr:</strong> {{dokumentnr}}<br>
        <strong>Revisjon:</strong> {{revisjon}}
      </p>
    `,
  
    "3": `
      <h2>Servicerapport – Ventilasjon</h2>
  
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3>Kundeinformasjon</h3>
      <p>
        <strong>Navn:</strong> {{kundenavn}}<br>
        <strong>Adresse:</strong> {{adresse}}, {{postnummer}} {{poststed}}<br>
        <strong>Telefon:</strong> {{telefon}}<br>
        <strong>E-post:</strong> {{epost}}
      </p>
  
      <h3>Systeminformasjon</h3>
      <p>
        <strong>Systemnavn:</strong> {{systemnavn}}<br>
        <strong>Systemtype:</strong> {{systemTypeName}}<br>
        <strong>Serienummer:</strong> {{serienummer}}<br>
        <strong>Plassering:</strong> {{plassering}}
      </p>
  
      <h3>Utførte oppgaver</h3>
      <ul>
        <li>Bytte og rens av filtre</li>
        <li>Test av vifter og elektronikk</li>
        <li>Luftmålinger og justering</li>
        <li>Kontroll av aggregat og kanaler</li>
      </ul>
  
      <h3>Kommentarer</h3>
      <p>{{kommentarer}}</p>
  
      <h3>Utført av</h3>
      <p>
        <strong>Tekniker:</strong> {{teknikernavn}}<br>
        <strong>Firma:</strong> {{firmanavn}}<br>
        <strong>Dokumentnr:</strong> {{dokumentnr}}<br>
        <strong>Revisjon:</strong> {{revisjon}}
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
  