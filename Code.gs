/**
 * P4GN MATERIAL INTELLIGENCE — Apps Script API v0.1
 * 1) Isi SPREADSHEET_ID dengan ID Google Sheets hasil konversi workbook.
 * 2) Deploy sebagai Web App: Execute as Me; Who has access: Anyone.
 * 3) Salin URL /exec ke index.html pada konstanta API_URL.
 *
 * API hanya membaca database. Tidak ada API key AI dan tidak ada data peserta.
 */
const SPREADSHEET_ID = "PASTE_GOOGLE_SHEETS_ID_HERE";
const CACHE_SECONDS = 300;

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const action = params.action || "bootstrap";
  let payload;
  try {
    if (action === "ping") {
      payload = { ok: true, app: "P4GN Material Intelligence", version: "0.1", timestamp: new Date().toISOString() };
    } else if (action === "bootstrap") {
      payload = getBootstrap_();
    } else {
      payload = { ok: false, error: "Aksi tidak dikenal: " + action };
    }
  } catch (err) {
    payload = { ok: false, error: String(err && err.message ? err.message : err) };
  }

  const callback = String(params.callback || "");
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\\.]{0,80}$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(payload) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getBootstrap_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get("p4gn_bootstrap_v01");
  if (cached) return JSON.parse(cached);

  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf("PASTE_") === 0) {
    throw new Error("SPREADSHEET_ID belum diisi pada Code.gs.");
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Bank_Materi_60");
  if (!sheet) throw new Error("Sheet Bank_Materi_60 tidak ditemukan.");

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return { ok: true, modules: [], count: 0 };

  const groups = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const code = (row[8] || "").trim(); // I: Kode Materi
    if (!code) continue;
    if (!groups[code]) {
      groups[code] = {
        code: code,
        title: row[1] || "",
        duration: row[2] || "",
        substance: row[3] || "",
        explanation: row[4] || "",
        output: row[5] || "",
        pks: [],
        consultantNotes: []
      };
    }
    const pkNo = row[9] || "";
    const keyMessage = row[6] || "";
    if (keyMessage) {
      groups[code].pks.push({ no: pkNo, message: keyMessage });
    }
    if (row[11] && groups[code].consultantNotes.indexOf(row[11]) === -1) {
      groups[code].consultantNotes.push(row[11]);
    }
  }

  // Tambahkan poin detail dan status keterlacakan dari matriks analisis.
  const analysis = ss.getSheetByName("Matriks_Analisis");
  if (analysis) {
    const a = analysis.getDataRange().getDisplayValues();
    for (let i = 1; i < a.length; i++) {
      const code = (a[i][3] || "").trim();
      if (!groups[code]) continue;
      if (!groups[code].details) groups[code].details = [];
      groups[code].details.push({
        substance: a[i][1] || "",
        detail: a[i][2] || "",
        sourceId: a[i][4] || "",
        segment: a[i][6] || "",
        status: a[i][7] || "",
        note: a[i][9] || ""
      });
    }
  }

  const modules = Object.keys(groups).sort().map(k => groups[k]);
  const result = {
    ok: true,
    app: "P4GN Material Intelligence",
    version: "0.1",
    source: "Bank_Materi_60 + Matriks_Analisis",
    count: modules.length,
    modules: modules
  };
  cache.put("p4gn_bootstrap_v01", JSON.stringify(result), CACHE_SECONDS);
  return result;
}

/** Jalankan manual dari editor setelah SPREADSHEET_ID diisi untuk menguji koneksi. */
function testConnection() {
  const result = getBootstrap_();
  Logger.log("Modul terbaca: " + result.count);
  Logger.log(result.modules.slice(0, 2));
}
