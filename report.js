const serviceTemplates = {
    "1": `
      <h2>Servicerapport – Varmepumpe</h2>
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3>Kunde</h3>
      <p><strong>Navn:</strong> {{kundenavn}}</p>
  
      <h3>System</h3>
      <p>
        <strong>Systemnavn:</strong> {{systemnavn}}<br>
        <strong>Systemtype:</strong> {{systemTypeName}}
      </p>
  
      <h3>Kommentarer</h3>
      <p>{{kommentarer}}</p>
  
      <h3>Tekniker</h3>
      <p>{{teknikernavn}}</p>
    `,
  
    "2": `
      <h2>Servicerapport – Sanitæranlegg</h2>
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3>Kunde</h3>
      <p><strong>Navn:</strong> {{kundenavn}}</p>
  
      <h3>Systemtype</h3>
      <p>{{systemTypeName}}</p>
  
      <h3>Kommentarer</h3>
      <p>{{kommentarer}}</p>
  
      <h3>Tekniker</h3>
      <p>{{teknikernavn}}</p>
    `,
  
    "3": `
      <h2>Servicerapport – Ventilasjon</h2>
      <p><strong>Dato:</strong> {{dato}}</p>
  
      <h3>Kunde</h3>
      <p><strong>Navn:</strong> {{kundenavn}}</p>
  
      <h3>System</h3>
      <p>
        <strong>Systemnavn:</strong> {{systemnavn}}<br>
        <strong>Systemtype:</strong> {{systemTypeName}}
      </p>
  
      <h3>Kommentarer</h3>
      <p>{{kommentarer}}</p>
  
      <h3>Tekniker</h3>
      <p>{{teknikernavn}}</p>
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
  