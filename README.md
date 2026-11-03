# P4GN Material Intelligence — Prototype v0.1

## Isi paket
- `index.html` — antarmuka web statis untuk GitHub Pages.
- `Code.gs` — API baca Google Sheets melalui Google Apps Script.
- `appsscript.json` — manifest Apps Script.
- `README.md` — panduan instalasi dan pengujian.

## Arsitektur
GitHub Pages (frontend) → Google Apps Script Web App (API JSONP) → Google Sheets (database).

Versi ini tidak menggunakan API AI berbayar. Fitur AI Slide Studio menghasilkan prompt yang dapat disalin ke ChatGPT, Gemini, Canva AI, atau Gamma.

## A. Siapkan Google Sheets
1. Unggah `P4GN_Material_Intelligence_v0.1.xlsx` ke Google Drive.
2. Buka file dengan Google Sheets, lalu pilih **File → Save as Google Sheets** bila belum dikonversi.
3. Pastikan sheet asli berikut tetap ada: `Bank_Materi_60` dan `Matriks_Analisis`.
4. Salin ID spreadsheet dari URL:
   `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## B. Pasang Apps Script
1. Dari Google Sheets, pilih **Extensions → Apps Script**.
2. Ganti isi `Code.gs` dengan file `Code.gs` dari paket ini.
3. Pada baris `SPREADSHEET_ID`, tempel ID spreadsheet.
4. Simpan. Jalankan fungsi `testConnection` dari editor.
5. Berikan otorisasi saat diminta. Log seharusnya menampilkan jumlah modul yang terbaca (target awal 43).
6. Pilih **Deploy → New deployment → Web app**.
7. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Deploy dan salin URL yang berakhiran `/exec`.

Jika spreadsheet organisasi membatasi akses "Anyone", deployment harus mengikuti kebijakan admin Google Workspace. Jangan membuka akses spreadsheet mentah ke publik; yang dipublikasikan hanya API baca melalui Apps Script sesuai persetujuan pengelola.

## C. Hubungkan frontend
1. Buka `index.html`.
2. Cari:
   `const API_URL = "PASTE_GAS_WEB_APP_URL_HERE";`
3. Ganti dengan URL Web App `/exec`, contoh:
   `const API_URL = "https://script.google.com/macros/s/DEPLOYMENT_ID/exec";`
4. Simpan.

## D. Publikasikan GitHub Pages
1. Buat repository GitHub, misalnya `p4gn-material-intelligence`.
2. Unggah `index.html` ke root repository.
3. Buka **Settings → Pages**.
4. Pilih deploy dari branch `main`, folder `/root`.
5. Simpan dan tunggu URL Pages aktif.

Jika ingin domain khusus, atur DNS dan file `CNAME` setelah situs GitHub Pages berjalan.

## E. Pengujian
- Buka URL Web App `/exec?action=ping` untuk memastikan API aktif.
- Buka URL `/exec?action=bootstrap` untuk melihat JSON database.
- Buka situs GitHub Pages; status koneksi muncul di bawah header.
- Pastikan katalog menampilkan 43 kode modul dan tiga poin kunci per modul.
- Pilih beberapa modul, isi konteks, lalu uji rancangan, panduan, dan prompt AI.

## Batasan versi 0.1
- Pemilihan modul masih manual melalui pencarian katalog. Sistem belum membuat rekomendasi otomatis berdasarkan tag karena pemetaan segmen/situasi/tujuan per modul belum divalidasi.
- Output alokasi waktu merupakan rancangan indikatif dan perlu disesuaikan fasilitator.
- Data regulasi, statistik, contoh kasus, dan rujukan harus diperiksa sebelum dipakai.
- Prompt AI hanya menggunakan materi yang dipilih; AI diminta tidak menambah klaim, angka, kasus, atau referensi.
- API hanya membaca spreadsheet. Tidak ada fitur mengubah database atau mengumpulkan data pribadi peserta.

## Tahap pengembangan berikutnya
1. Validasi `Tag_Materi` bersama tim substansi.
2. Aktifkan rekomendasi modul berbasis tag segmen × situasi × tujuan.
3. Tambahkan penyuntingan urutan dan alokasi waktu per modul.
4. Tambahkan ekspor panduan ke DOCX/PDF dan ekspor kerangka slide.
5. Tambahkan mekanisme versi dan persetujuan materi.
