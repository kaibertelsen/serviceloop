const serviceTemplates = {
    "1": `<h2>Servicerapport – Varmepumpe</h2><p><strong>Dato:</strong> {{dato}}</p><p><strong>Kunde:</strong> {{kundenavn}}</p><p>{{kommentarer}}</p><p>Tekniker: {{teknikernavn}}</p>`,
    "2": `<h2>Servicerapport – Sanitæranlegg</h2><p><strong>Dato:</strong> {{dato}}</p><p>Kunde: {{kundenavn}}</p><p>{{kommentarer}}</p>`,
    "3": `<h2>Servicerapport – Ventilasjon</h2><p><strong>Dato:</strong> {{dato}}</p><p>Kunde: {{kundenavn}}</p><p>{{kommentarer}}</p>`
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
  