

// Sett din Uploadcare public key her (IKKE secret key i browser)
window.UPLOADCARE_PUB_KEY = "ce308699a99257e7687a";
const UPLOADCARE_UPLOAD_ENDPOINT = "https://upload.uploadcare.com/base/";

/**
 * makePdffromHTML
 * @param {Quill} quill - Quill-instansen din
 * @param {HTMLElement|null} serviceElement - valgfri status/progress-label/knapp
 * @param {Object} opts - valg for filnavn, sideformat osv.
 * @returns {Promise<{uuid:string,url:string, filename:string,size:number}>}
 */
async function makePdffromHTML(quillOrHtml, statusEl = null, opts = {}) {
    const {
      filename = "quill-dokument.pdf",
      format = "a4",
      orientation = "portrait",
      marginMm = [12, 12, 16, 12],
      scale = 2.5,
      widthPx = 794,      // ~A4 bredde ved 96dpi
      store = "1",
      uploadcarePubKey = (typeof window !== "undefined" ? window.UPLOADCARE_PUB_KEY : undefined)
    } = opts;
  
    const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };
  
    // 0) Sjekk avhengighet
    if (typeof html2pdf !== "function") {
      throw new Error("html2pdf.js mangler. Inkluder bundle-skriptet før du kaller makePdffromHTML.");
    }
  
    try {
      setStatus?.("Forbereder…");
  
      // 1) Hent HTML fra Quill eller fra string
      let html = "";
      if (quillOrHtml && typeof quillOrHtml.getModule === "function") {
        // ser ut som en Quill-instans
        html = (quillOrHtml?.root?.innerHTML || "").trim();
      } else if (typeof quillOrHtml === "string") {
        html = quillOrHtml.trim();
      } else {
        throw new Error("Ugyldig input: send inn Quill-instans eller HTML-string.");
      }
      if (!html || html === "<p><br></p>") {
        throw new Error("HTML-innholdet er tomt.");
      }
  
     // -- Lag containeren (erstatter din gamle variant) --
        const container = document.createElement("div");
        Object.assign(container.style, {
        position: "fixed",
        left: "-10000px",  // offscreen
        top: "0",
        width: (opts?.widthPx ?? 794) + "px",
        minHeight: "1px",
        background: "#ffffff",
        color: "#000000",
        padding: "0",
        margin: "0",
        // Viktig: behold layout/visibility, men gjør den usynlig visuelt
        opacity: "0",
        pointerEvents: "none",
        // IKKE visibility:hidden og IKKE display:none
        });
        container.innerHTML = html;
  
        // Print/base CSS – legg til !important for å vinne over dark theme
        const style = document.createElement("style");
        style.textContent = `
        @page { size: A4; margin: 0 }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        html, body, div, span, p, h1, h2, h3, h4, h5, h6 { color: #000 !important; }
        img, svg { max-width: 100%; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 6px; }
        .page-break { page-break-after: always; }
        `;
        container.prepend(style);
        document.body.appendChild(container);
  
      // 3) Vent på fonter og bilder
      setStatus?.("Laster ressurser…");
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch {}
      }
      const imgs = Array.from(container.querySelectorAll("img"));
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return img.decode?.().catch(() =>
          new Promise(res => { img.onload = img.onerror = () => res(); })
        );
      }));
  
      // 4) Valider layout
      const { offsetWidth, offsetHeight } = container;
      if (offsetWidth === 0 || offsetHeight === 0) {
        container.style.visibility = "visible"; // gjør synlig for feilsøking
        throw new Error("Render-container har 0 bredde/høyde. Sjekk CSS og widthPx.");
      }
  
      // 5) HTML → PDF (Blob)
      setStatus?.("Genererer PDF…");
      // … senere i html2pdf-kallet: tving bakgrunn
        const pdfBlob = await html2pdf()
        .from(container)
        .set({
        margin: marginMm,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
            scale,
            useCORS: true,
            backgroundColor: "#ffffff", // <- viktig
            logging: false
        },
        jsPDF: { unit: "mm", format, orientation }
        })
        .outputPdf("blob");

        console.log("pdfBlob size (bytes):", pdfBlob.size);
  
      // 6) Rydd opp
      container.remove();
  
      // 7) Uploadcare
      setStatus?.("Laster opp til Uploadcare…");
      const pubKey = uploadcarePubKey;
      if (!pubKey) throw new Error("Mangler Uploadcare public key (uploadcarePubKey eller window.UPLOADCARE_PUB_KEY).");
  
      const form = new FormData();
      form.append("UPLOADCARE_PUB_KEY", pubKey);
      form.append("UPLOADCARE_STORE", store);
      form.append("file", pdfBlob, filename);
  
      const res = await fetch("https://upload.uploadcare.com/base/", { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload feilet: ${res.status} ${txt}`);
      }
      const data = await res.json(); // { file: "<uuid>" }
      const uuid = data.file;
      const url = `https://ucarecdn.com/${uuid}/`;
  
      setStatus?.("Ferdig ✅");
      return { uuid, url, filename, size: pdfBlob.size };
    } catch (err) {
      setStatus?.("Feil ❌");
      console.error(err);
      throw err;
    }
  }
  
