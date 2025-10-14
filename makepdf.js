

// Sett din Uploadcare public key her (IKKE secret key i browser)
const UPLOADCARE_PUB_KEY = "ce308699a99257e7687a"; // f.eks. "demopublickey"
const UPLOADCARE_UPLOAD_ENDPOINT = "https://upload.uploadcare.com/base/";

/**
 * makePdffromHTML
 * @param {Quill} quill - Quill-instansen din
 * @param {HTMLElement|null} serviceElement - valgfri status/progress-label/knapp
 * @param {Object} opts - valg for filnavn, sideformat osv.
 * @returns {Promise<{uuid:string,url:string, filename:string,size:number}>}
 */
async function makePdffromHTML(quill, serviceElement = null, opts = {}) {
  const {
    filename = "quill-dokument.pdf",
    format = "a4",                // jsPDF format
    orientation = "portrait",
    marginMm = [10, 10, 10, 10],  // [top,right,bottom,left]
    scale = 2,                    // html2canvas skalering (2–3 gir skarpere tekst)
    store = "1",                  // "1" = lagre permanent i Uploadcare
    widthPx = 794,                // ~A4 bredde @ 96dpi (gir pene brudd)
  } = opts;

  const setStatus = (t) => { if (serviceElement) serviceElement.textContent = t; };

  try {
    setStatus("Forbereder…");

    // 1) Hent HTML fra Quill
    const html = quill.root.innerHTML;

    // 2) Lag en isolert container for render (unngår layout-støy)
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.width = widthPx + "px";
    container.style.padding = "0";
    container.style.margin = "0";
    container.style.background = "#fff";
    container.innerHTML = html;

    // Print-vennlig base-CSS (kan utvides)
    const style = document.createElement("style");
    style.textContent = `
      @page { size: A4; margin: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      img, svg { max-width: 100%; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 6px; }
      h1,h2,h3 { page-break-after: avoid; }
      .page-break { page-break-after: always; }
    `;
    container.prepend(style);

    document.body.appendChild(container);

    setStatus("Genererer PDF…");

    // 3) HTML → PDF (Blob)
    const pdfBlob = await html2pdf()
      .from(container)
      .set({
        margin: marginMm,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format, orientation }
      })
      .outputPdf("blob");

    // Rydd opp i DOM
    document.body.removeChild(container);

    setStatus("Laster opp til Uploadcare…");

    // 4) Last opp til Uploadcare
    if (!UPLOADCARE_PUB_KEY) {
      throw new Error("Mangler UPLOADCARE_PUB_KEY");
    }

    const form = new FormData();
    form.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUB_KEY);
    form.append("UPLOADCARE_STORE", store);
    form.append("file", pdfBlob, filename);

    const res = await fetch(UPLOADCARE_UPLOAD_ENDPOINT, { method: "POST", body: form });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Upload feilet: ${res.status} ${txt}`);
    }

    const data = await res.json();      // { file: "<uuid>" }
    const uuid = data.file;
    const url = `https://ucarecdn.com/${uuid}/`;

    setStatus("Ferdig ✅");

    return {
      uuid,
      url,
      filename,
      size: pdfBlob.size
    };
  } catch (err) {
    setStatus("Feil ❌");
    console.error(err);
    throw err;
  }
}
