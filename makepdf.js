

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
async function makePdffromHTML(quill, statusEl = null, opts = {}) {
    const {
      filename = "quill-dokument.pdf",
      format = "a4",
      orientation = "portrait",
      marginMm = [12,12,16,12],
      scale = 2.5,
      widthPx = 794, // ~A4-bredde ved 96dpi
      store = "1"
    } = opts;
  
    const setStatus = (t) => { if (statusEl) statusEl.textContent = t; };
  
    try {
      setStatus?.("Forbereder…");
  
      // 1) Hent HTML fra Quill – sjekk at det faktisk finnes innhold
      const html = (quill?.root?.innerHTML || "").trim();
      if (!html || html === "<p><br></p>") {
        throw new Error("Quill-innholdet er tomt");
      }
  
      // 2) Lag en offscreen container som *ikke* er display:none (må ha layout)
      const container = document.createElement("div");
      Object.assign(container.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: widthPx + "px",
        minHeight: "1px",
        background: "#ffffff",
        color: "#000000",
        padding: "0",
        margin: "0",
        visibility: "hidden" // skjult visuelt, men fortsatt layout
      });
      container.innerHTML = html;
  
      // Litt print-vennlig base-CSS
      const style = document.createElement("style");
      style.textContent = `
        @page { size: A4; margin: 0 }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        img, svg { max-width: 100%; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 6px; }
        .page-break { page-break-after: always; }
        body, p, span, div { color: inherit; }
      `;
      container.prepend(style);
  
      document.body.appendChild(container);
  
      // 3) Vent på fonter og bilder, ellers blir canvas “blank”
      setStatus?.("Laster ressurser…");
      if (document.fonts && document.fonts.ready) {
        try { await document.fonts.ready; } catch {}
      }
      const imgs = Array.from(container.querySelectorAll("img"));
      await Promise.all(imgs.map(img => {
        // decode() er best; fallback til onload
        if (img.complete) return Promise.resolve();
        return img.decode?.().catch(() =>
          new Promise(res => { img.onload = img.onerror = () => res(); })
        );
      }));
  
      // 4) Verifiser at vi faktisk har noe å rendre
      const hasVisibleText = container.textContent.trim().length > 0;
      const hasImgs = imgs.length > 0;
      const { offsetWidth, offsetHeight } = container;
      if (offsetWidth === 0 || offsetHeight === 0) {
        throw new Error("Render-container har 0 bredde/høyde");
      }
      if (!hasVisibleText && !hasImgs) {
        console.warn("Ingen synlig tekst eller bilder i dokumentet.");
      }
  
      // 5) HTML → PDF (Blob). Tips: backgroundColor for å unngå “transparent→hvit”
      setStatus?.("Genererer PDF…");
      const pdfBlob = await html2pdf()
        .from(container)
        .set({
          margin: marginMm,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale, useCORS: true, backgroundColor: "#ffffff", logging: false },
          jsPDF: { unit: "mm", format, orientation }
        })
        .outputPdf("blob");
  
      // 6) Rydd opp
      container.remove();
  
      // 7) Last opp til Uploadcare
      setStatus?.("Laster opp til Uploadcare…");
      if (!window.UPLOADCARE_PUB_KEY) throw new Error("Mangler UPLOADCARE_PUB_KEY i global scope");
  
      const form = new FormData();
      form.append("UPLOADCARE_PUB_KEY", window.UPLOADCARE_PUB_KEY);
      form.append("UPLOADCARE_STORE", store);
      form.append("file", pdfBlob, filename);
  
      const res = await fetch("https://upload.uploadcare.com/base/", { method: "POST", body: form });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload feilet: ${res.status} ${txt}`);
      }
      const data = await res.json();
      const url = `https://ucarecdn.com/${data.file}/`;
  
      setStatus?.("Ferdig ✅");
      return { uuid: data.file, url, filename, size: pdfBlob.size };
  
    } catch (err) {
      setStatus?.("Feil ❌");
      console.error(err);
      throw err;
    }
  }
  
