// Public key i browser (IKKE secret)
window.UPLOADCARE_PUB_KEY = "ce308699a99257e7687a";
const UPLOADCARE_UPLOAD_ENDPOINT = "https://upload.uploadcare.com/base/";

// Hjelpere
async function toDataURL(url) {
  if (!url) return null;
  const res = await fetch(url, { cache: "no-store" });
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result);
    r.readAsDataURL(blob);
  });
}
function escapeHtml(s="") {
  return s
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function buildFacilityInfoHtml({name="", model="", location=""}={}) {
  return `<p>Anlegg: ${escapeHtml(name)} - ${escapeHtml(model)} - ${escapeHtml(location)}<br /><br /><br /><br /><br /></p>`;
}

/**
 * makeBrandedPdf
 * Svart header (logo + “Servicerapport — dato” + firmanavn), valgfri anleggsinfo-HTML rett etter header,
 * HTML-innhold (fra Quill), signatur-blokk styrt via opts, og footer med kontaktinfo. Laster opp til Uploadcare.
 */
async function makeBrandedPdf(quillOrHtml, statusEl = null, opts = {}) {
  const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };
  const todayNb = new Date().toLocaleDateString("nb-NO");
  const HEADER_HEIGHT = 64;

  const {
    filename = "service-rapport.pdf",
    pageSize = "A4",
    pageMargins = [28, HEADER_HEIGHT + 28, 28, 36],

    // Branding
    logoUrl,
    companyName = "Attentio",
    contact = {
      phone: "+47 00 00 00 00",
      email: "post@attentio.no",
      web:   "attentio.no",
      address: "Eksempelveien 1, 0001 Oslo"
    },

    // Headertekst
    reportTitle = "Servicerapport",
    reportDate = todayNb,

    // --- NYTT: Anleggsinfo ---
    // Enten ferdig HTML:
    facilityInfoHtml,
    // eller variabler som bygges til HTML:
    facilityInfo, // { name, model, location }

    // Signatur-blokk
    signatureUrl,
    signOffPrefix = "Med vennlig hilsen,",
    signOffName = "Kai Bertelsen",
    signOffCompany = companyName,

    // Upload
    uploadcarePubKey = window.UPLOADCARE_PUB_KEY,
    store = "1",
    // Valgfri: vise tynn linje under header
    showHeaderDivider = false,
  } = opts;

  // 1) HTML fra Quill eller string
  let html = "";
  if (quillOrHtml && typeof quillOrHtml.getModule === "function") {
    html = (quillOrHtml.root?.innerHTML || "").trim();
  } else if (typeof quillOrHtml === "string") {
    html = quillOrHtml.trim();
  } else {
    throw new Error("Send inn Quill-instans eller HTML-string.");
  }
  if (!html || html === "<p><br></p>") throw new Error("HTML-innholdet er tomt.");

  setStatus?.("Laster logo/signatur…");
  const [logoDataUrl, sigDataUrl] = await Promise.all([
    toDataURL(logoUrl),
    toDataURL(signatureUrl),
  ]);

  setStatus?.("Genererer PDF…");

  // 2) HTML → pdfmake
  const htmlContent = htmlToPdfmake(html, { window });

  // 2b) Bygg/konverter anleggsinfo-HTML (om satt)
  let infoContent = [];
  if (facilityInfoHtml || facilityInfo) {
    const infoHtml = facilityInfoHtml || buildFacilityInfoHtml(facilityInfo);
    infoContent = htmlToPdfmake(infoHtml, { window });
  }

  // 3) DocDefinition
  const docDefinition = {
    pageSize,
    pageMargins,

    header: {
      margin: [0, 0, 0, 0],
      table: {
        widths: [140, '*', 'auto'],
        body: [[
          {
            border: [false, false, false, false],
            fillColor: '#000',
            margin: [28, 10, 10, 10],
            stack: [ logoDataUrl ? { image: logoDataUrl, fit: [120, 40] } : { text: " " } ]
          },
          {
            border: [false, false, false, false],
            fillColor: '#000',
            margin: [0, 12, 0, 10],
            alignment: 'center',
            stack: [
              { text: reportTitle, color: '#FFF', bold: true, fontSize: 12, margin: [0, 0, 0, 2] },
              { text: reportDate,  color: '#FFF', fontSize: 10 }
            ]
          },
          {
            border: [false, false, false, false],
            fillColor: '#000',
            margin: [10, 18, 28, 10],
            alignment: 'right',
            text: companyName,
            color: '#FFF',
            bold: true,
            fontSize: 12
          }
        ]]
      },
      layout: 'noBorders'
    },

    footer: (currentPage, pageCount) => {
      const left = `${contact.address}  |  ${contact.phone}  |  ${contact.email}  |  ${contact.web}`;
      const right = `${currentPage} / ${pageCount}`;
      return {
        margin: [28, 6, 28, 10],
        columns: [
          { text: left, fontSize: 9, color: '#666' },
          { text: right, alignment: 'right', fontSize: 9, color: '#666' }
        ]
      };
    },

    content: [
      // (valgfritt) tynn linje under header
      ...(showHeaderDivider ? [
        { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 } ], margin: [0, 6, 0, 8] }
      ] : []),

      // --- Anleggsinfo kommer her, rett etter header ---
      ...(infoContent.length ? [
        ...infoContent,
        { text: ' ', margin: [0, 4, 0, 4] }
      ] : []),

      // Hovedinnholdet fra Quill/HTML
      ...htmlContent,

      // Spasering før hilsen/signatur
      { text: ' ', margin: [0, 12, 0, 0] },

      // Signatur-blokk
      {
        margin: [0, 8, 0, 0],
        stack: [
          { text: signOffPrefix, style: 'p' },
          sigDataUrl ? { image: sigDataUrl, width: 150, margin: [0, 4, 0, 2] } : { text: '' },
          { text: signOffName, bold: true, margin: [0, 2, 0, 0] },
          { text: signOffCompany, color: '#555', margin: [0, 0, 0, 0] }
        ]
      }
    ],

    styles: {
      h1: { fontSize: 22, bold: true, margin: [0, 12, 0, 8] },
      h2: { fontSize: 18, bold: true, margin: [0, 10, 0, 6] },
      h3: { fontSize: 15, bold: true, margin: [0, 10, 0, 4] },
      p:  { fontSize: 11, margin: [0, 4, 0, 4], lineHeight: 1.25 },
      li: { fontSize: 11, margin: [0, 2, 0, 2] }
    },
    defaultStyle: { fontSize: 11 }
  };

  // 4) Blob
  const pdfBlob = await new Promise((resolve, reject) => {
    try { pdfMake.createPdf(docDefinition).getBlob(resolve); }
    catch (e) { reject(e); }
  });

  // 5) Uploadcare
  setStatus?.("Laster opp til Uploadcare…");
  if (!uploadcarePubKey) throw new Error("Mangler Uploadcare public key.");

  const form = new FormData();
  form.append("UPLOADCARE_PUB_KEY", uploadcarePubKey);
  form.append("UPLOADCARE_STORE", store);
  form.append("file", pdfBlob, filename);

  const res = await fetch(UPLOADCARE_UPLOAD_ENDPOINT, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload feilet: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const url = `https://ucarecdn.com/${data.file}/`;

  setStatus?.("Ferdig ✅");
  return { uuid: data.file, url, filename, size: pdfBlob.size };
}