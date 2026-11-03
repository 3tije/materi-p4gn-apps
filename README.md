# P4GN Material Intelligence v0.5.1

## Fokus pembaruan
- Menambahkan jalur rekomendasi awal yang hanya memakai jejak segmen eksplisit dari kolom `Asal Data (segmen)` pada `Matriks_Analisis`.
- Jika tersedia pemetaan `Pemetaan_Konteks` berstatus `DISETUJUI`, sistem memakai rekomendasi kontekstual penuh (segmen wajib cocok; situasi, tujuan, durasi, dan kata kunci menjadi penambah skor).
- Jika belum ada pemetaan penuh yang disetujui, aplikasi menampilkan daftar awal berdasarkan segmen sumber, tanpa skor kecocokan dan dengan peringatan bahwa situasi/tujuan belum dinilai.
- Normalisasi label sumber `PT` menjadi pilihan aplikasi `MAHASISWA/PT`.
- Penyuluh tetap dapat menambah modul manual, menghapus, dan mengurutkan modul terpilih.
- Bank Materi menjadi katalog eksplorasi 43 modul. Panduan Penyuluh tetap menghasilkan alokasi waktu dan arahan fasilitasi sesuai durasi.

## Isi paket
- `index.html` — frontend GitHub Pages, menggunakan URL Web App yang sudah diberikan.
- `Code.gs` — backend Apps Script, menggunakan spreadsheet ID database v0.2.
- `appsscript.json` dan folder `assets`.

## Pemasangan
1. Buka proyek Apps Script P4GN M-I. Ganti seluruh isi `Code.gs` dengan file dari paket ini.
2. Simpan dan jalankan `testConnection()`; target 43 modul.
3. Pastikan sheet `Pemetaan_Konteks` tetap ada dengan header template. Sheet ini boleh tetap kosong.
4. Deploy → Manage deployments → Edit deployment aktif → New version → Deploy.
5. Di repository GitHub Pages, ganti `index.html` dan folder `assets` dengan yang ada di paket ini.
6. Commit, tunggu publikasi, lalu hard refresh (Ctrl+Shift+R).

## Perilaku rekomendasi
- Prioritas 1: baris `Pemetaan_Konteks` berstatus `DISETUJUI`; segmen sasaran wajib cocok. Hasil ditampilkan sebagai rekomendasi kontekstual dengan skor dan alasan.
- Fallback: jika belum ada pemetaan penuh yang disetujui, sistem mencari baris `Matriks_Analisis` yang `Asal Data (segmen)`-nya sama dengan segmen pilihan. Hasil disebut **daftar awal berbasis jejak sumber**, bukan rekomendasi penuh; tidak ada skor situasi/tujuan. ID sumber ditampilkan sebagai jejak.
- Label sumber `PT` dinormalisasi menjadi `MAHASISWA/PT` agar sesuai dengan pilihan di aplikasi.
- Pemetaan situasi/tujuan tidak diisi atau ditebak otomatis. Lengkapi dan setujui setelah telaah substansi dan ID sumber.

## Uji setelah pemasangan
- Apps Script `testConnection()` → 43 modul.
- `/exec?action=health` → moduleCount 43.
- `/exec?action=bootstrap` → katalog 43 modul.
- `/exec?action=recommend&segment=SMP&situation=Orientasi%20sekolah%2Fkampus&objective=Membangun%20sikap%20dan%20norma%20protektif&duration=45%20menit` → daftar awal modul dengan jejak sumber SMP, disertai keterangan bahwa situasi dan tujuan belum dinilai.

## Integritas sumber
`Bank_Materi_60` dan `Matriks_Analisis` tidak diubah. Sheet `Rujukan_Segmen_Sumber` pada workbook pendamping adalah ringkasan turunan untuk audit, bukan pengganti sumber. Panduan waktu merupakan rancangan fasilitasi indikatif dan tidak mengubah substansi modul.
