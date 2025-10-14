// Public key i browser (IKKE secret)
window.UPLOADCARE_PUB_KEY = "ce308699a99257e7687a";
const UPLOADCARE_UPLOAD_ENDPOINT = "https://upload.uploadcare.com/base/";

// Hjelper: last bilde-URL til dataURL (for pdfmake)
async function toDataURL(url) {
  if (!url) return null;
  const res = await fetch(url, { cache: "no-store" });
  const blob = await res.blob();
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

/**
 * makeBrandedPdf
 * Lager PDF med svart header (logo + "Servicerapport — dato" + firmanavn),
 * html-innhold, "mvh. Kai Bertelsen" + signatur, og footer med kontaktinfo.
 *
 * @param {Quill|string} quillOrHtml  - Quill-instans ELLER ren HTML-string
 * @param {HTMLElement|null} statusEl - valgfri status-node
 * @param {Object} opts
 *   - filename, pageSize, pageMargins
 *   - logoUrl, signatureUrl
 *   - companyName, contact: { phone, email, web, address }
 *   - reportTitle (default "Servicerapport"), reportDate (default dagens dato nb-NO)
 *   - uploadcarePubKey, store
 * @returns {Promise<{uuid, url, filename, size}>}
 */
async function makeBrandedPdf(quillOrHtml, statusEl = null, opts = {}) {
  const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };

  const todayNb = new Date().toLocaleDateString('nb-NO');
  const HEADER_HEIGHT = 64; // reserver plass i top-margin for headeren

  const {
    filename = "service-rapport.pdf",
    pageSize = "A4",
    // ekstra toppmargin for å ikke havne under header
    pageMargins = [28, HEADER_HEIGHT + 28, 28, 36],
    logoUrl,
    signatureUrl,
    companyName = "Attentio",
    contact = {
      phone: "+47 00 00 00 00",
      email: "post@attentio.no",
      web:   "attentio.no",
      address: "Eksempelveien 1, 0001 Oslo"
    },
    reportTitle = "Servicerapport",
    reportDate = todayNb,
    uploadcarePubKey = window.UPLOADCARE_PUB_KEY,
    store = "1"
  } = opts;

  // 1) Hent HTML
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
    toDataURL(signatureUrl)
  ]);

  setStatus?.("Genererer PDF…");

  // 2) Konverter HTML → pdfmake content
  const htmlContent = htmlToPdfmake(html, { window });

  // 3) DocDefinition med SVART HEADER og hvit tekst
  const docDefinition = {
    pageSize,
    pageMargins,

    header: {
      margin: [0, 0, 0, 0],
      table: {
        widths: [140, '*', 'auto'],
        body: [[
          // Venstre: logo
          {
            border: [false, false, false, false],
            fillColor: '#000000',
            margin: [28, 10, 10, 10], // L T R B
            stack: [
              logoDataUrl ? { image: logoDataUrl, fit: [120, 40] } : { text: " ", color: '#000000' }
            ]
          },
          // Midten: tittel + dato
          {
            border: [false, false, false, false],
            fillColor: '#000000',
            margin: [0, 12, 0, 10],
            alignment: 'center',
            stack: [
              { text: reportTitle, color: '#FFFFFF', bold: true, fontSize: 12, margin: [0, 0, 0, 2] },
              { text: reportDate,  color: '#FFFFFF', fontSize: 10 }
            ]
          },
          // Høyre: firmanavn
          {
            border: [false, false, false, false],
            fillColor: '#000000',
            margin: [10, 18, 28, 10],
            alignment: 'right',
            text: companyName,
            color: '#FFFFFF',
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
      // Tynn linje under header (valgfritt)
      { canvas: [ { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 } ], margin: [0, 6, 0, 10] },

      // HTML-innholdet
      ...htmlContent,

      // Spasering før hilsen/signatur
      { text: ' ', margin: [0, 12, 0, 0] },

      // Hilsen + signatur
      {
        margin: [0, 8, 0, 0],
        stack: [
          { text: 'Med vennlig hilsen,', style: 'p' },
          sigDataUrl ? { image: sigDataUrl, width: 150, margin: [0, 4, 0, 2] } : { text: '' },
          { text: 'Kai Bertelsen', bold: true, margin: [0, 2, 0, 0] },
          { text: companyName, color: '#555', margin: [0, 0, 0, 0] }
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

  // 4) Lag Blob fra pdfmake
  const pdfBlob = await new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (e) { reject(e); }
  });
  console.log("pdfmake blob size:", pdfBlob.size);

  // 5) Last opp til Uploadcare
  setStatus?.("Laster opp til Uploadcare…");
  if (!uploadcarePubKey) throw new Error("Mangler Uploadcare public key.");

  const form = new FormData();
  form.append("UPLOADCARE_PUB_KEY", uploadcarePubKey);
  form.append("UPLOADCARE_STORE", store);
  form.append("file", pdfBlob, filename);

  const res = await fetch(UPLOADCARE_UPLOAD_ENDPOINT, { method: "POST", body: form });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload feilet: ${res.status} ${txt}`);
  }
  const data = await res.json(); // { file: "<uuid>" }
  const url = `https://ucarecdn.com/${data.file}/`;

  setStatus?.("Ferdig ✅");
  return { uuid: data.file, url, filename, size: pdfBlob.size };
}