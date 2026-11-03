# P4GN Material Intelligence v0.5

## Fokus pembaruan
- Rancang Penyuluhan: konteks kegiatan diisi lebih dahulu, lalu tombol **Cari modul terkait**.
- Rekomendasi otomatis hanya mengambil baris pemetaan berstatus `DISETUJUI`; jika belum ada pemetaan, aplikasi menyampaikan bahwa rekomendasi belum aktif dan menyediakan pencarian manual.
- Modul dapat ditambahkan dari rekomendasi atau pencarian manual, dihapus, dan diurutkan sebelum rancangan dibuat.
- Bank Materi menjadi katalog eksplorasi 43 modul, dengan indeks kode/judul, pencarian substansi/poin kunci, dan filter durasi sumber.
- Panduan Penyuluh menjadi panduan fasilitasi berbasis durasi: alokasi waktu, pembuka/ice breaking, materi inti, interaksi, refleksi, dan penutup. Ada pilihan metode, catatan penyuluh, naskah, dan cetak.
- AI Slide Studio menyusun prompt berdasarkan modul terpilih.

## Isi paket
- `index.html` — frontend GitHub Pages, sudah menunjuk URL Web App yang saat ini diberikan pengguna.
- `Code.gs` — backend Apps Script, sudah menggunakan spreadsheet ID database v0.2 yang diberikan pengguna.
- `appsscript.json`
- `assets/logo-bnn.webp`, `assets/logo-ananda.webp`

## Langkah pemasangan
1. Di proyek Apps Script yang saat ini dipakai aplikasi, salin seluruh isi `Code.gs` dari paket ini untuk menggantikan kode lama.
2. Simpan. Jalankan `testConnection()`; target 43 modul.
3. Tambahkan sheet `Pemetaan_Konteks` ke spreadsheet dari file `P4GN_Material_Intelligence_v0.2_PLUS_PEMETAAN_v0.5.xlsx` (salin sheet tersebut ke database utama). Sertakan header persis seperti template. Pemetaan masih kosong dan memang belum diaktifkan sampai ditelaah.
4. Deploy → Manage deployments → Edit deployment aktif → New version → Deploy. URL deployment diharapkan tetap sama.
5. Di GitHub repository `materip4gn.dit-ie.my.id`, ganti `index.html` dan folder `assets` dengan isi paket v0.5. Jangan unggah folder pembungkus ke root; unggah file index dan folder assets-nya.
6. Commit perubahan, tunggu GitHub Pages selesai, lalu hard refresh browser (Ctrl+Shift+R).

## Perilaku rekomendasi
- Endpoint baru: `?action=recommend`.
- Hanya baris `Pemetaan_Konteks` dengan Status Pemetaan = `DISETUJUI` yang dinilai.
- Bobot: segmen 25, situasi 25, tujuan perubahan 30, durasi 10, kebutuhan/kata kunci 10.
- Jika sheet belum ada atau belum memiliki pemetaan yang disetujui, tidak ada rekomendasi otomatis yang dikarang. Penyuluh tetap dapat mencari dan memilih modul manual.

## Catatan integritas sumber
- Sheet sumber `Bank_Materi_60` dan `Matriks_Analisis` tetap dipakai.
- Pemetaan sasaran/situasi/tujuan tidak diisi otomatis atau ditebak. Isi hanya berdasarkan telaah substansi dan ID sumber pendukung.
- Panduan fasilitasi adalah usulan alokasi operasional yang dapat disesuaikan, bukan perubahan terhadap substansi modul sumber.
- Durasi modul pada sumber tidak otomatis dianggap sebagai durasi kegiatan. Panduan membagi waktu kegiatan secara indikatif berdasarkan total waktu yang dipilih.

## Pengujian setelah pemasangan
- Apps Script: `testConnection()` → 43 modul.
- `/exec?action=health` → moduleCount 43.
- `/exec?action=bootstrap` → katalog 43 modul.
- `/exec?action=recommend&segment=PAUD&situation=Penyuluhan%20rutin&objective=Meningkatkan%20pengetahuan&duration=15%20menit` → sebelum pemetaan disetujui, respons menyatakan mapping belum siap.
