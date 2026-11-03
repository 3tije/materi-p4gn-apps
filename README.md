# P4GN Material Intelligence v0.6

## Fokus pembaruan
AI Slide Studio menjadi **Slide-by-Slide Presentation Studio**.

### Fitur
- Master Blueprint presentasi berdasarkan konteks dan modul terpilih.
- Prompt mandiri untuk setiap slide.
- Tombol salin prompt per slide.
- Tombol salin seluruh Master Blueprint.
- Pengaturan gaya visual dan jumlah slide (otomatis, 6, 8, 10, 12, 15).
- Poin kunci modul dan pesan sumber dimasukkan apa adanya dari data modul.
- Prompt menegaskan bahwa AI tidak boleh menambah fakta, angka, regulasi, statistik, atau referensi yang tidak ada di sumber.
- Visual, ilustrasi, komposisi, dan tata letak boleh dikembangkan; substansi tetap.
- Frontend tetap memakai API_URL dan backend v0.5.1. Tidak ada perubahan database atau Code.gs.

## Cara pemasangan
1. Ekstrak ZIP.
2. Ganti `index.html` dan folder `assets` pada repository GitHub Pages.
3. Tidak perlu mengganti `Code.gs`, spreadsheet, atau deployment Apps Script untuk pembaruan AI Slide Studio ini.
4. Commit perubahan dan buka situs dengan hard refresh (Ctrl+Shift+R).

## Cara menggunakan
1. Pilih konteks kegiatan.
2. Pilih satu atau beberapa modul dari rekomendasi/katalog.
3. Klik Susun Rancangan Penyuluhan.
4. Buka AI Slide Studio.
5. Pilih gaya visual dan jumlah slide.
6. Klik **Buat Master Blueprint & Prompt per Slide**.
7. Baca pesan sumber pada tiap slide.
8. Klik **Salin Prompt Slide** untuk menghasilkan slide satu per satu di ChatGPT/Gemini/Canva/Gamma.
9. Gunakan **Salin Master Blueprint** untuk memberi konteks dan standar keseluruhan presentasi.

## Catatan penting
- Prompt slide memuat pesan kunci dan substansi dari modul yang dipilih. AI diminta mempertahankannya.
- Prompt tidak menjamin mesin AI eksternal akan patuh sempurna; hasil akhir tetap perlu diperiksa penyuluh.
- Slide pengantar, aktivitas, dan penutup merupakan struktur fasilitasi. Jangan memasukkan klaim faktual yang tidak didukung sumber.
- Versi ini tidak mengubah rekomendasi modul atau database.
