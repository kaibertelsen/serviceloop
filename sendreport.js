function sendReportToCustomer(system = {}, service = {}) {
    // ── Branding / konstanter ───────────────────────────────────────────────────
    const LOGO_URL = "https://cdn.prod.website-files.com/6847e4300d2206b0ffac86d1/68495ac7e72d8c41ea1e06a3_Corsoft-web-textAsset%202.svg";
    const COMPANY_NAME = "Varme VVS AS";
    const BRAND_COLOR = "#004080"; // kun brukt i eventuell utheving i teksten
  
    // ── Hjelpere (alt inni funksjonen) ──────────────────────────────────────────
    const esc = (s = "") =>
      String(s)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#39;");
  
    const fmtDate = (d) => {
      try {
        if (!d) return "–";
        const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
        return date.toLocaleDateString("nb-NO");
      } catch { return "–"; }
    };
  
    const safeFileName = (s = "servicerapport") =>
      s.normalize("NFKD")
       .replace(/[^\w\s.-]/g, "")
       .trim()
       .replace(/\s+/g, "_")
       .slice(0, 80);
  
    // ── Hent data trygt ─────────────────────────────────────────────────────────
    const customer     = service.customer || system.customer || {};
    const to           = customer.email || service.email || ""; // ← mottaker
    const customername = customer.name  || service.customername || "Kunde";
  
    const systemname   = system.name || "–";
    const model        = system.system_type_name || system.model || "–";
    const location     = system.location || "–";
  
    const dateReadable = service.date ? fmtDate(service.date) : "–";
    const serviceNr    = service.nr || service.serviceNr || "–";
    const reportUrl    = service.pdfurl || service.reportlink || ""; // ← offentlig URL til PDF
  
    const username     = (service.user && service.user.name) || service.technicianName || "Tekniker";
  
    // ── Emnelinje ───────────────────────────────────────────────────────────────
    const Subject =
      `Servicerapport – ${systemname !== "–" ? systemname : "anlegg"}`
      + (serviceNr !== "–" ? ` (${serviceNr})` : "")
      + (dateReadable !== "–" ? ` – ${dateReadable}` : "");
  
    // ── Vedlegg ─────────────────────────────────────────────────────────────────
    // De fleste Zapier/e-post-trinn aksepterer et array av offentlige fil-URLer,
    // eller et array av objekter. Vi sender et objekt med filename + url.
    const defaultBaseName =
      (serviceNr && serviceNr !== "–")
        ? `Servicerapport_${serviceNr}`
        : `Servicerapport_${systemname !== "–" ? systemname : "anlegg"}_${dateReadable !== "–" ? dateReadable : ""}`;
    const attachmentFilename = `${safeFileName(defaultBaseName)}.pdf`;
  
    const attachments = reportUrl
      ? [{ filename: attachmentFilename, url: reportUrl }]
      : []; // Hvis du *må* sende bare URL-strenger: bruk [reportUrl] i stedet.
  
    // ── HTML-body (samme kort-layout, men UTEN knapp/lenke) ─────────────────────
    const Html = `
  <!doctype html>
  <html lang="nb">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${esc(Subject)}</title>
    </head>
    <body style="margin:0;padding:0;background:#f1f4f8;font-family:Arial,Helvetica,sans-serif;color:#111;">
      <div style="max-width:600px;margin:0 auto;padding:30px;">
        <div style="max-width:600px;margin:0 auto;padding:30px;background:#fff;border-radius:12px;box-shadow:0 3px 12px rgba(0,0,0,0.06)">
          
          <div style="text-align:center;margin-bottom:24px;">
            <img src="${esc(LOGO_URL)}"
                 alt="${esc(COMPANY_NAME)} logo"
                 style="max-height:60px; max-width:220px; height:auto; width:auto;" />
          </div>
  
          <p style="font-size:18px;margin:0 0 16px 0;">Hei ${esc(customername)},</p>
  
          <p style="font-size:16px;line-height:1.6;margin:0 0 12px 0;">
            Servicen på ditt anlegg <strong style="color:${esc(BRAND_COLOR)}">${esc(systemname)}</strong> er fullført.
          </p>
  
          <p style="font-size:16px;line-height:1.6;margin:0 0 12px 0;">
            Dato: <strong>${esc(dateReadable)}</strong>
            ${serviceNr !== "–" ? `&nbsp;•&nbsp; Service-nr: <strong>${esc(serviceNr)}</strong>` : ""}
          </p>
  
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px 0;">
            Modell: <strong>${esc(model)}</strong> &nbsp;•&nbsp; Lokasjon: <strong>${esc(location)}</strong>
          </p>
  
          <p style="font-size:16px;line-height:1.6;margin:18px 0 0 0;">
            Den komplette servicerapporten ligger vedlagt som PDF.
          </p>
  
          <p style="margin-top:26px;">
            Med vennlig hilsen,<br />
            <strong>${esc(username)}</strong><br />
            ${esc(COMPANY_NAME)}
          </p>
  
          <p style="color:#777;font-size:13px;margin-top:20px;line-height:1.4">
            Denne e-posten er sendt automatisk fra vårt system. Svar gjerne direkte på e-posten dersom du ønsker kontakt.
          </p>
        </div>
      </div>
    </body>
  </html>
    `.trim();
  
    return { to, Subject, Html, attachments };
  }
  