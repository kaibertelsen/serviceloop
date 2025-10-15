function htmlsendReportToCustomer(system = {}, service = {}) {
    // ── Branding / konstanter (tilpass ved behov) ────────────────────────────────
    const LOGO_URL = "https://cdn.prod.website-files.com/6847e4300d2206b0ffac86d1/68495ac7e72d8c41ea1e06a3_Corsoft-web-textAsset%202.svg";
    const COMPANY_NAME = "Varme VVS AS";
    const BRAND_COLOR = "#004080"; // aksentfarge i teksten/knapp
  
    // ── Små hjelpere (alt inni funksjonen) ──────────────────────────────────────
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
  
    // ── Hent data trygt fra objektene ───────────────────────────────────────────
    const customer     = service.customer || system.customer || {};
    const to           = customer.email || service.email || "";
    const customername = customer.name || service.customername || "Kunde";
  
    const systemname   = system.name || "–";
    const model        = system.system_type_name || system.model || "–";
    const location     = system.location || "–";
  
    const dateReadable = service.date ? fmtDate(service.date) : "–";
    const serviceNr    = service.nr || service.serviceNr || "–";
    const reportlink   = service.pdfurl || service.reportlink || "";
  
    const username     = (service.user && service.user.name) || service.technicianName || "Tekniker";
  
    // ── Emnelinje ───────────────────────────────────────────────────────────────
    const Subject =
      `Servicerapport – ${systemname !== "–" ? systemname : "anlegg"}`
      + (serviceNr !== "–" ? ` (${serviceNr})` : "")
      + (dateReadable !== "–" ? ` – ${dateReadable}` : "");
  
    // ── HTML-body (samme stil/markup som eksempelet ditt) ───────────────────────
    const Html = `
  <!doctype html>
  <html lang="nb">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${esc(Subject)}</title>
    </head>
    <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#111;">
      <div style="max-width:600px;margin:0 auto;padding:30px;">
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;padding:30px;background:#fff;border-radius:8px;box-shadow:0 3px 12px rgba(0,0,0,0.05)">
          
          <div style="text-align:center; margin-bottom:30px;">
            <img src="${esc(LOGO_URL)}"
                 alt="${esc(COMPANY_NAME)} logo"
                 style="max-height:60px; max-width:220px;" />
          </div>
  
          <p style="font-size:18px;">Hei ${esc(customername)},</p>
  
          <p style="font-size:16px;line-height:1.6">
            Servicen på ditt anlegg <strong style="color:${esc(BRAND_COLOR)}">${esc(systemname)}</strong> er fullført.
          </p>
          <p style="font-size:16px;line-height:1.6; margin:0 0 10px 0;">
            Dato: <strong style="color:${esc(BRAND_COLOR)}">${esc(dateReadable)}</strong>
            ${serviceNr !== "–" ? ` &nbsp;•&nbsp; Service-nr: <strong style="color:${esc(BRAND_COLOR)}">${esc(serviceNr)}</strong>` : ""}
          </p>
          <p style="font-size:16px;line-height:1.6; margin:0 0 16px 0;">
            Modell: <strong>${esc(model)}</strong> &nbsp;•&nbsp; Lokasjon: <strong>${esc(location)}</strong>
          </p>
  
          ${reportlink
            ? `<div style="margin:20px 0 14px 0;">
                 <a href="${esc(reportlink)}"
                    style="display:inline-block;background:${esc(BRAND_COLOR)};color:#fff;text-decoration:none;
                           padding:12px 18px;border-radius:8px;font-weight:700;">
                   Åpne servicerapport (PDF)
                 </a>
               </div>
               <div style="font-size:13px;color:#666;word-break:break-all;margin-top:6px;">
                 Eller kopier lenken: <a href="${esc(reportlink)}" style="color:${esc(BRAND_COLOR)};text-decoration:none;">${esc(reportlink)}</a>
               </div>`
            : `<div style="margin:16px 0;color:#b42318;font-weight:600;">OBS: Rapportlenke mangler.</div>`
          }
  
          <p style="font-size:16px;line-height:1.6;margin:18px 0 0 0;">
            Ta gjerne kontakt om noe er uklart eller om du har spørsmål til rapporten.
          </p>
  
          <p style="margin-top:30px;">
            Med vennlig hilsen,<br />
            <strong>${esc(username)}</strong><br />
            ${esc(COMPANY_NAME)}
          </p>
  
          <p style="color:#777;font-size:13px;margin-top:20px">
            Denne e-posten er sendt automatisk fra vårt system. Svar gjerne direkte på e-posten dersom du ønsker kontakt.
          </p>
        </div>
      </div>
    </body>
  </html>
    `.trim();
  
    // Returner datapakken til Zapier:
    return { to, Subject, Html };
  }
  