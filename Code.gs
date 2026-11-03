const SPREADSHEET_ID = "1WpiE_ScwqIzJPjyAxX5GtFPJsZKh2X5TMMYOcOZR0pk";
const SHEET_BANK = "Bank_Materi_60";
const SHEET_MATRIX = "Matriks_Analisis";
const SHEET_MAPPING = "Pemetaan_Konteks";

function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const action = p.action || "bootstrap";
  let payload;
  try {
    if (action === "ping") payload = {ok:true, service:"P4GN Material Intelligence", version:"0.5"};
    else if (action === "bootstrap") payload = {ok:true, modules:getModules()};
    else if (action === "detail") payload = {ok:true, references:getReferences(String(p.code || ""))};
    else if (action === "recommend") payload = recommendModules_(p);
    else if (action === "health") payload = getHealth_();
    else payload = {ok:false, error:"Permintaan tidak dikenali."};
  } catch (err) {
    payload = {ok:false, error:String(err && err.message ? err.message : err)};
  }
  const json = JSON.stringify(payload);
  const callback = p.callback;
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
function getSheet_(name, optional) {
  if (!SPREADSHEET_ID) throw new Error("ID spreadsheet belum diatur.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(name);
  if (!sh && !optional) throw new Error("Sheet " + name + " tidak ditemukan.");
  return sh;
}
function headerMap_(headers) { const o={}; headers.forEach((v,i)=>o[String(v||"").trim()]=i); return o; }
function cell_(row,map,name) { const i=map[name]; return i===undefined?"":String(row[i]||"").trim(); }
function getModules() {
  const values=getSheet_(SHEET_BANK).getDataRange().getDisplayValues(); if(values.length<2)return[];
  const h=headerMap_(values[0]);
  if(h["Kode Materi"]===undefined || h["Dimensi/Kandidat Judul Materi"]===undefined) throw new Error("Struktur kolom Bank_Materi_60 tidak sesuai.");
  const grouped={};
  values.slice(1).forEach(row=>{
    const code=cell_(row,h,"Kode Materi"); if(!code)return;
    if(!grouped[code]) grouped[code]={code,title:cell_(row,h,"Dimensi/Kandidat Judul Materi"),duration:cell_(row,h,"Durasi"),substance:cell_(row,h,"Substansi"),explanation:cell_(row,h,"Penjelasan"),output:cell_(row,h,"Output yang Diharapkan"),pillar:cell_(row,h,"Pillar Content"),pks:[]};
    const no=cell_(row,h,"No. PK"),message=cell_(row,h,"Pesan Kunci"),detail=cell_(row,h,"Poin detail sumber (utama, per materi)");
    if((message||detail)&&!grouped[code].pks.some(x=>x.no===no))grouped[code].pks.push({no,message,detail});
  });
  return Object.keys(grouped).sort().map(k=>grouped[k]);
}
function getReferences(code) {
  if(!code)return[]; const values=getSheet_(SHEET_MATRIX).getDataRange().getDisplayValues(); if(values.length<2)return[];
  const h=headerMap_(values[0]); if(h["Kode Materi"]===undefined)throw new Error("Kolom Kode Materi tidak ditemukan di Matriks_Analisis.");
  return values.slice(1).filter(r=>cell_(r,h,"Kode Materi")===code).map(r=>({title:cell_(r,h,"Judul Materi"),substance:cell_(r,h,"Substansi Materi"),sourceId:cell_(r,h,"ID Substansi Sumber"),sourceRow:cell_(r,h,"Baris Excel (matrik_1_nov)"),segment:cell_(r,h,"Asal Data (segmen)"),detail:cell_(r,h,"Poin Detail"),status:cell_(r,h,"Status"),secondary:cell_(r,h,"Materi Sekunder"),note:cell_(r,h,"Catatan")}));
}
function splitValues_(s){return String(s||"").split(/[;,|]/).map(x=>x.trim().toLowerCase()).filter(Boolean);}
function matches_(cell,input){if(!String(cell||"").trim())return false;const vals=splitValues_(cell);return vals.some(v=>v===String(input||"").trim().toLowerCase());}
function normalizeSegment_(value){
  const s=String(value||"").trim().toUpperCase();
  if(["PT","MAHASISWA","MAHASISWA/PT","PERGURUAN TINGGI"].includes(s)) return "MAHASISWA/PT";
  return s;
}
function recommendModules_(p){
  const target=normalizeSegment_(p.segment);
  if(!target) return {ok:true,mappingReady:false,recommendations:[],message:"Pilih segmen sasaran terlebih dahulu."};

  // Jalur utama: pemetaan konteks yang telah disetujui reviewer.
  const sh=getSheet_(SHEET_MAPPING,true);
  if(sh){
    const values=sh.getDataRange().getDisplayValues();
    if(values.length>=2){
      const h=headerMap_(values[0]);
      const required=["Kode Modul","Segmen Sasaran","Situasi","Tujuan Perubahan","Durasi Kegiatan","Status Pemetaan"];
      const missing=required.filter(k=>h[k]===undefined);
      if(missing.length) throw new Error("Kolom Pemetaan_Konteks belum lengkap: "+missing.join(", "));
      const modules=getModules(), byCode={}; modules.forEach(m=>byCode[m.code]=m);
      const situation=String(p.situation||"").trim(), objective=String(p.objective||"").trim();
      const issue=String(p.issue||"").toLowerCase(), duration=String(parseInt(p.duration,10)||"");
      const results=[];
      values.slice(1).forEach(row=>{
        if(String(cell_(row,h,"Status Pemetaan")).trim().toUpperCase()!=="DISETUJUI") return;
        const code=cell_(row,h,"Kode Modul"), mod=byCode[code]; if(!mod) return;
        if(!splitValues_(cell_(row,h,"Segmen Sasaran")).some(v=>normalizeSegment_(v)===target)) return;
        let score=25, reasons=["Memiliki pemetaan yang disetujui untuk segmen sasaran"];
        if(matches_(cell_(row,h,"Situasi"),situation)){score+=25;reasons.push("Sesuai situasi kegiatan");}
        if(matches_(cell_(row,h,"Tujuan Perubahan"),objective)){score+=30;reasons.push("Mendukung tujuan perubahan");}
        if(matches_(cell_(row,h,"Durasi Kegiatan"),duration)){score+=10;reasons.push("Sesuai durasi kegiatan");}
        const kw=cell_(row,h,"Kata Kunci");
        if(kw&&issue&&splitValues_(kw).some(k=>issue.includes(k))){score+=10;reasons.push("Berkaitan dengan kebutuhan khusus");}
        results.push({code,title:mod.title,substance:mod.substance,duration:mod.duration,score,reasons,
          sourceIds:cell_(row,h,"ID Sumber Pendukung"),mappingNote:cell_(row,h,"Catatan Alasan"),basis:"APPROVED_CONTEXT_MAPPING"});
      });
      const unique={}; results.forEach(x=>{if(!unique[x.code]||unique[x.code].score<x.score)unique[x.code]=x;});
      if(Object.keys(unique).length){
        return {ok:true,mappingReady:true,fullContextReady:true,basis:"APPROVED_CONTEXT_MAPPING",
          recommendations:Object.values(unique).sort((a,b)=>b.score-a.score).slice(0,8),
          message:"Rekomendasi menggunakan pemetaan konteks yang telah disetujui."};
      }
    }
  }

  // Jalur aman sementara: gunakan hanya keterlacakan segmen yang eksplisit di Matriks_Analisis.
  // Tidak mengarang kecocokan situasi/tujuan dan tidak memberi skor.
  const matrix=getSheet_(SHEET_MATRIX).getDataRange().getDisplayValues();
  if(matrix.length<2) return {ok:true,mappingReady:false,recommendations:[],message:"Data keterlacakan sumber belum tersedia."};
  const mh=headerMap_(matrix[0]);
  ["Kode Materi","Asal Data (segmen)","ID Substansi Sumber"].forEach(k=>{
    if(mh[k]===undefined) throw new Error("Kolom "+k+" tidak ditemukan pada Matriks_Analisis.");
  });
  const modules=getModules(), byCode={}; modules.forEach(m=>byCode[m.code]=m);
  const grouped={};
  matrix.slice(1).forEach(row=>{
    const code=cell_(row,mh,"Kode Materi"), seg=cell_(row,mh,"Asal Data (segmen)");
    if(!code||!seg||normalizeSegment_(seg)!==target||!byCode[code]) return;
    if(!grouped[code]) grouped[code]={code,sourceIds:[],referenceCount:0};
    grouped[code].referenceCount++;
    const sid=cell_(row,mh,"ID Substansi Sumber");
    if(sid&&!grouped[code].sourceIds.includes(sid)) grouped[code].sourceIds.push(sid);
  });
  const recommendations=Object.values(grouped).map(x=>{
    const m=byCode[x.code];
    return {code:x.code,title:m.title,substance:m.substance,duration:m.duration,
      reasons:["Memiliki "+x.referenceCount+" baris keterlacakan sumber untuk segmen "+target,
        "Situasi dan tujuan perubahan belum dinilai melalui pemetaan yang disetujui"],
      sourceIds:x.sourceIds.join("; "),referenceCount:x.referenceCount,basis:"SOURCE_SEGMENT_ONLY"};
  }).sort((a,b)=>b.referenceCount-a.referenceCount || a.code.localeCompare(b.code)).slice(0,12);
  return {ok:true,mappingReady:recommendations.length>0,fullContextReady:false,basis:"SOURCE_SEGMENT_ONLY",
    recommendations,
    message:recommendations.length
      ?"Daftar awal berdasarkan jejak sumber pada segmen sasaran. Ini bukan skor kecocokan penuh; penyuluh perlu menilai kesesuaian situasi dan tujuan."
      :"Belum ditemukan baris sumber untuk segmen sasaran ini. Gunakan pencarian manual di Bank Materi."};
}
function testConnection(){const m=getModules();Logger.log("Jumlah modul: "+m.length);Logger.log("Contoh: "+JSON.stringify(m[0]||{}));return m.length;}
function getHealth_(){const m=getModules(), matrix=getSheet_(SHEET_MATRIX).getDataRange().getDisplayValues(), map=getSheet_(SHEET_MAPPING,true);return{ok:true,service:"P4GN Material Intelligence",version:"0.5",moduleCount:m.length,referenceRows:Math.max(0,matrix.length-1),mappingSheet:!!map,mappingRows:map?Math.max(0,map.getLastRow()-1):0,expectedModules:43,ready:m.length===43};}
