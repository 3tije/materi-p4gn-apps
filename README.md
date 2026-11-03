# P4GN Material Intelligence v0.3

## Pembaruan
- Logo BNN di kiri dan Ananda Bersinar di kanan header.
- Tautan pena.mytije.com menggantikan label prototype.
- Catatan penggunaan dan pesan teknis integrasi dihilangkan dari tampilan publik.
- API dibagi menjadi dua jalur: katalog ringkas (`bootstrap`) dan jejak sumber per modul (`detail`).
- Tidak menggunakan CacheService atau PropertiesService untuk menampung payload besar.
- Materi dan poin kunci ditarik dari `Bank_Materi_60`; jejak substansi/sumber ditarik dari `Matriks_Analisis`.

## Isi paket
- `index.html`
- `Code.gs`
- `appsscript.json`
- `assets/logo-bnn.png`
- `assets/logo-ananda.png`

## Hubungkan Google Sheets
1. Gunakan spreadsheet hasil konversi workbook revisi istilah terbaru.
2. Pastikan sheet `Bank_Materi_60` dan `Matriks_Analisis` tersedia.
3. Buka Extensions → Apps Script.
4. Ganti seluruh isi `Code.gs` dengan file `Code.gs` pada paket ini.
5. Isi `SPREADSHEET_ID` dengan ID spreadsheet.
6. Simpan, lalu jalankan `testConnection()` dan beri otorisasi. Target awal: 43 modul.
7. Deploy → New deployment → Web app; Execute as: Me; akses: Anyone (sesuai kebijakan Workspace).
8. Salin URL `/exec`.
9. Pada `index.html`, isi `API_URL` dengan URL `/exec` tersebut (tanpa parameter).
10. Unggah `index.html` dan folder `assets` ke root repository GitHub Pages.

## Uji API
- `/exec?action=ping`
- `/exec?action=bootstrap` → daftar modul dan poin kunci.
- `/exec?action=detail&code=M01` → jejak sumber untuk modul M01.

## Catatan integrasi
- Katalog ringkas dan referensi modul diambil terpisah untuk mencegah satu respons membengkak.
- Jika kode Apps Script diubah, buat deployment versi baru atau edit deployment aktif ke versi terbaru.
- File paket ini belum dapat mengisi URL deployment dan ID spreadsheet milik pengguna. Integrasi final baru terverifikasi setelah kedua nilai tersebut dipasang dan API diuji.

## Uji kesehatan koneksi (setelah deployment)
- `/exec?action=health` → menampilkan jumlah modul dan baris referensi tanpa mengirim seluruh isi database.
- Target `moduleCount`: 43.
- `/exec?action=bootstrap` → mengirim katalog ringkas untuk aplikasi.
- `/exec?action=detail&code=M01` → mengambil jejak referensi satu modul.

## Catatan penting
Jika aplikasi lama menampilkan error `Argumen terlalu besar: value`, ganti kode Apps Script lama dengan `Code.gs` pada paket ini lalu deploy versi baru. Kode baru tidak menyimpan seluruh payload katalog ke Script Properties/Cache; katalog dan detail referensi dikirim melalui endpoint terpisah.
