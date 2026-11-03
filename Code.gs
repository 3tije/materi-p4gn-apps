const SPREADSHEET_ID = "GANTI_DENGAN_ID_GOOGLE_SHEETS";
const SHEET_BANK = "Bank_Materi_60";
const SHEET_MATRIX = "Matriks_Analisis";

function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const action = p.action || "bootstrap";
  let payload;
  try {
    if (action === "ping") payload = {ok:true, service:"P4GN Material Intelligence"};
    else if (action === "bootstrap") payload = {ok:true, modules:getModules()};
    else if (action === "detail") payload = {ok:true, references:getReferences(String(p.code || ""))};
    else if (action === "health") payload = getHealth_();
    else payload = {ok:false, error:"Permintaan tidak dikenali."};
  } catch (err) {
    payload = {ok:false, error:String(err && err.message ? err.message : err)};
  }
  const json = JSON.stringify(payload);
  const callback = p.callback;
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_(name) {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf("GANTI_") === 0) {
    throw new Error("ID spreadsheet belum diatur pada Apps Script.");
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error("Sheet " + name + " tidak ditemukan.");
  return sh;
}

function getModules() {
  const values = getSheet_(SHEET_BANK).getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const h = headerMap_(values[0]);
  if (h["Kode Materi"] === undefined || h["Dimensi/Kandidat Judul Materi"] === undefined) {
    throw new Error("Struktur kolom Bank_Materi_60 tidak sesuai dengan database materi.");
  }
  const grouped = {};
  values.slice(1).forEach(row => {
    const code = cell_(row,h,"Kode Materi");
    if (!code) return;
    if (!grouped[code]) {
      grouped[code] = {
        code:code,
        title:cell_(row,h,"Dimensi/Kandidat Judul Materi"),
        duration:cell_(row,h,"Durasi"),
        substance:cell_(row,h,"Substansi"),
        explanation:cell_(row,h,"Penjelasan"),
        output:cell_(row,h,"Output yang Diharapkan"),
        pks:[]
      };
    }
    const noPk = cell_(row,h,"No. PK");
    const message = cell_(row,h,"Pesan Kunci");
    const detail = cell_(row,h,"Poin detail sumber (utama, per materi)");
    if ((message || detail) && !grouped[code].pks.some(x => x.no === noPk)) {
      grouped[code].pks.push({no:noPk, message:message, detail:detail});
    }
  });
  return Object.keys(grouped).sort().map(k => grouped[k]);
}

function getReferences(code) {
  if (!code) return [];
  const values = getSheet_(SHEET_MATRIX).getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const h = headerMap_(values[0]);
  if (h["Kode Materi"] === undefined || h["Poin Detail"] === undefined) {
    throw new Error("Struktur kolom Matriks_Analisis tidak sesuai dengan database referensi.");
  }
  const result = [];
  values.slice(1).forEach(row => {
    if (cell_(row,h,"Kode Materi") !== code) return;
    result.push({
      title:cell_(row,h,"Judul Materi"),
      substance:cell_(row,h,"Substansi Materi"),
      sourceId:cell_(row,h,"ID Substansi Sumber"),
      sourceRow:cell_(row,h,"Baris Excel (matrik_1_nov)"),
      segment:cell_(row,h,"Asal Data (segmen)"),
      detail:cell_(row,h,"Poin Detail"),
      status:cell_(row,h,"Status"),
      secondary:cell_(row,h,"Materi Sekunder"),
      note:cell_(row,h,"Catatan")
    });
  });
  return result;
}

function headerMap_(headers) {
  const out = {};
  headers.forEach((v,i) => out[String(v || "").trim()] = i);
  return out;
}
function cell_(row, map, name) {
  const i = map[name];
  return (i === undefined || i < 0) ? "" : String(row[i] || "").trim();
}

function testConnection() {
  const modules = getModules();
  Logger.log("Jumlah modul: " + modules.length);
  Logger.log("Contoh: " + JSON.stringify(modules[0] || {}));
  return modules.length;
}

function getHealth_() {
  const modules = getModules();
  const matrix = getSheet_(SHEET_MATRIX).getDataRange().getDisplayValues();
  return {
    ok: true,
    service: "P4GN Material Intelligence",
    moduleCount: modules.length,
    referenceRows: Math.max(0, matrix.length - 1),
    expectedModules: 43,
    ready: modules.length > 0
  };
}
