
// Public key i browser (ikke secret)
window.UPLOADCARE_PUB_KEY = "ce308699a99257e7687a";
const UPLOADCARE_UPLOAD_ENDPOINT = "https://upload.uploadcare.com/base/";

/**
 * makePdfWithPdfmake
 * @param {Quill|string} quillOrHtml
 * @param {HTMLElement|null} statusEl
 * @param {Object} opts
 */
async function makePdfWithPdfmake(quillOrHtml, statusEl = null, opts = {}) {
  const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };
  const {
    filename = "rapport.pdf",
    pageSize = "A4",
    pageMargins = [20, 20, 24, 24], // pt
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

  setStatus?.("Genererer PDF…");

  // 2) HTML -> pdfmake docDefinition
  // htmlToPdfmake støtter h1-h6, p, ul/ol/li, b/i/u, tables m.m.
  const content = htmlToPdfmake(html, { window });

  const docDefinition = {
    pageSize,
    pageMargins,
    content,
    styles: {
      h1: { fontSize: 22, bold: true, margin: [0, 8, 0, 8] },
      h2: { fontSize: 18, bold: true, margin: [0, 8, 0, 6] },
      h3: { fontSize: 16, bold: true, margin: [0, 8, 0, 6] },
      p:  { fontSize: 11, margin: [0, 4, 0, 4] },
      li: { fontSize: 11, margin: [0, 2, 0, 2] }
    },
    defaultStyle: { fontSize: 11 }
  };

  // 3) Få Blob fra pdfmake
  const pdfBlob = await new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (e) { reject(e); }
  });

  // (valgfritt) sjekk størrelse
  console.log("pdfmake blob size:", pdfBlob.size);

  // 4) Last opp til Uploadcare
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
