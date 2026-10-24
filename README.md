# Pengingat Tugas

Aplikasi web statis untuk mencatat tugas kuliah beserta deadline. Sisa hari dihitung otomatis dan setiap tugas diberi penanda warna sesuai tingkat urgensi, sehingga tugas yang paling mendesak mudah terlihat.

Project ini dibuat untuk tugas kuliah dengan tema **pemecahan masalah sehari-hari**.

## Masalah

Mahasiswa sering lupa kapan deadline tugas dan baru menyadarinya setelah terlambat. Catatan di chat atau kertas tidak menunjukkan tugas mana yang paling mendesak.

## Fitur

- Menambah tugas dengan nama (maksimal 80 karakter), tanggal deadline, dan mata kuliah (opsional).
- Menampilkan label mata kuliah beserta kodenya, dengan warna berbeda untuk tiap mata kuliah.
- Menghitung sisa hari secara otomatis.
- Menampilkan badge dan warna status:
  - Merah: **Terlewat N hari**
  - Oranye: **Deadline hari ini**, **Besok**, atau **N hari lagi** (sisa 2-3 hari)
  - Hijau: **N hari lagi** (sisa lebih dari 3 hari)
  - Abu-abu: **Selesai**, dengan nama tugas dicoret
- Mengurutkan tugas yang belum selesai dari deadline terdekat; tugas selesai dipindahkan ke bawah.
- Menandai tugas selesai atau membatalkannya lewat checkbox.
- Menghapus satu tugas dengan tombol **Hapus**.
- Menghapus semua tugas selesai dengan tombol **Hapus semua yang selesai**.
- Filter **Semua**, **Belum selesai**, dan **Selesai**.
- Ringkasan jumlah tugas yang belum selesai dan yang terlewat.
- Menyimpan data di `localStorage`, sehingga data tetap ada setelah halaman di-refresh.

## Struktur File

```
pengingat-tugas/
├── index.html
├── style.css
├── script.js
└── README.md
```

| File | Isi |
| --- | --- |
| `index.html` | Struktur halaman: judul, form, filter, daftar tugas, dan tombol hapus semua yang selesai. |
| `style.css` | Tampilan satu kolom, warna status, dan tata letak responsif. |
| `script.js` | Logika aplikasi, perhitungan tanggal, penyimpanan, dan manipulasi DOM. |
| `README.md` | Dokumentasi project. |

## Cara Menjalankan

1. Pastikan ketiga file kode (`index.html`, `style.css`, `script.js`) berada dalam satu folder.
2. Buka `index.html` langsung di browser (klik dua kali file tersebut).
3. Aplikasi siap dipakai. Tidak perlu server, build tool, atau koneksi internet.

Data disimpan di `localStorage` browser dengan kunci `pengingat-tugas`. Data terikat pada browser dan lokasi file yang dipakai untuk membuka aplikasi.

## Konsep yang Dipakai

- **HTML:** struktur semantik, form, label, dan atribut aksesibilitas (`aria-label`, `aria-pressed`, `role="alert"`).
- **CSS:** variabel warna, Flexbox, Grid, media query untuk layar kecil, serta gaya fokus keyboard.
- **JavaScript:**
  - Variabel `let` dan `const`, array, serta objek.
  - Array objek `MATA_KULIAH` sebagai sumber pilihan dropdown mata kuliah.
  - Fungsi, percabangan `if`, dan perulangan `for`.
  - Event `submit` pada form, `click` pada tombol, dan `change` pada checkbox.
  - Manipulasi DOM dengan `createElement`, `appendChild`, `textContent`, `className`, dan `setAttribute`.
  - `localStorage` dan `JSON` untuk menyimpan data.
  - Parsing tanggal manual dengan `new Date(tahun, bulan - 1, hari)` agar tidak bergeser akibat zona waktu UTC.
- Teks dari pengguna selalu ditampilkan dengan `textContent`, bukan `innerHTML`.

## Format Data

Data disimpan sebagai array JSON dengan model berikut:

```js
{
  id: Number,
  nama: String,
  deadline: "YYYY-MM-DD",
  selesai: Boolean,
  mataKuliah: Number
}
```

`mataKuliah` berisi id dari daftar mata kuliah di `script.js`, atau `0` jika tugas tidak dikaitkan ke mata kuliah. Data lama yang belum memiliki field ini tetap terbaca dan dianggap `0`.

Daftar mata kuliah yang tersedia:

| Id | Mata kuliah | Kode |
| --- | --- | --- |
| 1 | Matematika Diskret | MWP53106 |
| 2 | Struktur Data | MWP53107 |
| 3 | Sistem Operasi | MWP53108 |
| 4 | Pemrograman Web | MWP53109 |
| 5 | Praktikum Pemrograman Web | MWP53110 |
| 6 | Pemrograman Berorientasi Objek | MWP53111 |
| 7 | Praktikum Algoritma Pemrograman | MWP53112 |
| 8 | Jaringan Komputer | MWP53113 |

Jika data di `localStorage` rusak atau penyimpanan tidak tersedia, aplikasi memulai dengan daftar kosong tanpa menampilkan error.

## Catatan Asistensi

Beberapa hal yang mungkin ditanyakan saat asistensi:

- **Mengapa tanggal tidak memakai `new Date("2026-10-27")`?** String dengan format `YYYY-MM-DD` dibaca JavaScript sebagai UTC. Di zona waktu Indonesia, hasilnya bisa mundur sehari. Karena itu `parseTanggal()` memecah string lalu memanggil `new Date(tahun, bulan - 1, hari)`.
- **Mengapa sisa hari dibulatkan?** Setelah kedua tanggal disamakan ke pukul 00.00, selisihnya dibagi jumlah milidetik dalam sehari dan dibulatkan agar tetap bulat meskipun ada pergantian waktu (DST) di zona waktu lain.
- **Mengapa urutan memakai perulangan biasa?** Pengurutan memakai bubble sort sederhana dengan fungsi `bandingkanTugas()`, sesuai materi perulangan dan `if`, tanpa `sort()` bawaan.
- **Mengapa nama tugas tampil sebagai teks?** Semua teks pengguna dimasukkan dengan `textContent`, sehingga `<b>tes</b>` muncul apa adanya, bukan sebagai HTML.
- **Mengapa `localStorage` dibungkus `try`/`catch`?** Beberapa browser memblokir penyimpanan saat file dibuka langsung. Aplikasi tetap berjalan, hanya datanya tidak tersimpan.
- **Apa yang terjadi jika data rusak?** `bacaPenyimpanan()` memeriksa setiap item. Jika ada satu item yang tidak sesuai model data, aplikasi mulai dari daftar kosong tanpa error.
- **Mengapa tugas lama tanpa `mataKuliah` tidak dianggap rusak?** `bacaMataKuliah()` mengembalikan `0` bila field tersebut tidak ada, sehingga data yang dibuat sebelum fitur mata kuliah ditambahkan tetap tampil. Nilai yang ada tetapi tidak dikenal tetap dianggap rusak.

## Pembuat

- Nama: Adesta Eka Saputra
- NIM: 25533955
