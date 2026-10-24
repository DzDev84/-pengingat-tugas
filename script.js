// ============================================================
// Pengingat Tugas
// JavaScript murni untuk materi pertemuan 1-3:
// variabel, array, fungsi, if, perulangan, event, dan DOM.
// ============================================================

// Kunci penyimpanan di localStorage.
const KUNCI_PENYIMPANAN = "pengingat-tugas";

// Tugas dengan sisa hari 0 sampai BATAS_MENDESAK_HARI dianggap mendesak.
const BATAS_MENDESAK_HARI = 3;

// Nama hari dan bulan untuk format tanggal Bahasa Indonesia.
const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Daftar mata kuliah. Nomor "id" dipakai untuk memberi warna pada label
// mata kuliah, dan "kode" ditampilkan kecil di samping namanya.
const MATA_KULIAH = [
  { id: 1, nama: "Matematika Diskret", kode: "MWP53106" },
  { id: 2, nama: "Struktur Data", kode: "MWP53107" },
  { id: 3, nama: "Sistem Operasi", kode: "MWP53108" },
  { id: 4, nama: "Pemrograman Web", kode: "MWP53109" },
  { id: 5, nama: "Praktikum Pemrograman Web", kode: "MWP53110" },
  { id: 6, nama: "Pemrograman Berorientasi Objek", kode: "MWP53111" },
  { id: 7, nama: "Praktikum Algoritma Pemrograman", kode: "MWP53112" },
  { id: 8, nama: "Jaringan Komputer", kode: "MWP53113" }
];

// Seluruh data tugas. Setiap tugas berbentuk:
// { id: Number, nama: String, deadline: "YYYY-MM-DD",
//   selesai: Boolean, mataKuliah: Number }
// "mataKuliah" berisi id dari MATA_KULIAH, atau 0 jika tidak dipilih.
let daftarTugas = [];

// Filter yang sedang aktif: "semua", "belum", atau "selesai".
let filterAktif = "semua";

// Elemen HTML yang dipakai berulang kali.
const formTugas = document.getElementById("form-tugas");
const inputNama = document.getElementById("input-nama");
const inputDeadline = document.getElementById("input-deadline");
const inputMataKuliah = document.getElementById("input-mata-kuliah");
const elemenPesanError = document.getElementById("pesan-error");
const elemenRingkasan = document.getElementById("ringkasan");
const elemenPesanKosong = document.getElementById("pesan-kosong");
const elemenDaftar = document.getElementById("daftar-tugas");
const tombolHapusSelesai = document.getElementById("tombol-hapus-selesai");
const tombolFilter = document.querySelectorAll(".tombol-filter");

// ------------------------------------------------------------
// Penyimpanan
// ------------------------------------------------------------

// Membaca tugas dari localStorage. Jika data tidak ada, rusak, atau
// localStorage tidak tersedia, kembalikan array kosong tanpa error.
function bacaPenyimpanan() {
  try {
    const teks = localStorage.getItem(KUNCI_PENYIMPANAN);

    if (teks === null) {
      return [];
    }

    const data = JSON.parse(teks);

    if (!Array.isArray(data)) {
      return [];
    }

    // Periksa setiap item. Jika ada satu saja yang tidak sesuai model
    // data, seluruh isi penyimpanan dianggap rusak.
    const hasil = [];
    const idDipakai = {};

    for (let i = 0; i < data.length; i++) {
      const tugas = data[i];

      if (!itemTugasValid(tugas)) {
        return [];
      }

      if (idDipakai[tugas.id] === true) {
        return [];
      }

      idDipakai[tugas.id] = true;
      hasil.push({
        id: tugas.id,
        nama: tugas.nama,
        deadline: tugas.deadline,
        selesai: tugas.selesai,
        // Tugas yang disimpan sebelum fitur mata kuliah belum punya
        // field ini. Agar data lama tidak hilang, nilainya dianggap 0.
        mataKuliah: bacaMataKuliah(tugas)
      });
    }

    return hasil;
  } catch (error) {
    // JSON rusak atau penyimpanan diblokir browser.
    return [];
  }
}

// Memeriksa apakah satu data tugas sesuai model data yang dipakai.
function itemTugasValid(tugas) {
  if (tugas === null || typeof tugas !== "object") {
    return false;
  }
  if (typeof tugas.id !== "number" || tugas.id <= 0 || tugas.id % 1 !== 0) {
    return false;
  }
  if (typeof tugas.nama !== "string" || tugas.nama.trim() === "") {
    return false;
  }
  if (typeof tugas.deadline !== "string") {
    return false;
  }
  // Panjang harus tepat 10 karakter agar sesuai model "YYYY-MM-DD".
  if (tugas.deadline.length !== 10) {
    return false;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(tugas.deadline) === false) {
    return false;
  }
  if (parseTanggal(tugas.deadline) === null) {
    return false;
  }
  if (typeof tugas.selesai !== "boolean") {
    return false;
  }

  const mataKuliah = bacaMataKuliah(tugas);

  if (mataKuliah === null) {
    return false;
  }

  return true;
}

// Mengambil id mata kuliah dari satu tugas. Tugas lama yang belum punya
// field "mataKuliah" dianggap tanpa mata kuliah (0). Hasilnya null jika
// nilainya ada tetapi tidak sesuai (bukan angka, atau id tidak dikenal).
function bacaMataKuliah(tugas) {
  if (typeof tugas.mataKuliah === "undefined") {
    return 0;
  }

  if (typeof tugas.mataKuliah !== "number" || tugas.mataKuliah % 1 !== 0) {
    return null;
  }

  // 0 berarti tanpa mata kuliah; selain itu harus id yang dikenal.
  if (tugas.mataKuliah !== 0 && cariMataKuliah(tugas.mataKuliah) === null) {
    return null;
  }

  return tugas.mataKuliah;
}

// Mencari mata kuliah berdasarkan id. Hasilnya null jika tidak ada.
function cariMataKuliah(id) {
  for (let i = 0; i < MATA_KULIAH.length; i++) {
    if (MATA_KULIAH[i].id === id) {
      return MATA_KULIAH[i];
    }
  }

  return null;
}

// Menyimpan seluruh daftar tugas ke localStorage.
function simpanTugas() {
  try {
    localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarTugas));
  } catch (error) {
    // Penyimpanan tidak tersedia atau penuh. Aplikasi tetap berjalan,
    // tetapi data tidak bertahan setelah halaman ditutup.
  }
}

// ------------------------------------------------------------
// Tanggal
// ------------------------------------------------------------

// Mengubah teks tanggal "YYYY-MM-DD" menjadi objek Date lokal.
// new Date("YYYY-MM-DD") sengaja tidak dipakai karena string itu
// dibaca sebagai UTC dan bisa menghasilkan hari yang berbeda.
function parseTanggal(teks) {
  if (typeof teks !== "string") {
    return null;
  }

  const bagian = teks.split("-");

  if (bagian.length !== 3) {
    return null;
  }

  const tahun = Number(bagian[0]);
  const bulan = Number(bagian[1]);
  const hari = Number(bagian[2]);

  if (!tahun || !bulan || !hari) {
    return null;
  }

  const tanggal = new Date(tahun, bulan - 1, hari);

  // Date akan menggeser tanggal yang tidak ada, misalnya 31 Februari.
  // Jika hasilnya tidak sama dengan input, tanggal tidak valid.
  if (
    tanggal.getFullYear() !== tahun ||
    tanggal.getMonth() !== bulan - 1 ||
    tanggal.getDate() !== hari
  ) {
    return null;
  }

  return tanggal;
}

// Menampilkan tanggal dengan format Indonesia,
// contoh: "Selasa, 27 Oktober 2026".
function formatTanggalIndonesia(teksDeadline) {
  const tanggal = parseTanggal(teksDeadline);

  if (tanggal === null) {
    return teksDeadline;
  }

  return (
    NAMA_HARI[tanggal.getDay()] + ", " +
    tanggal.getDate() + " " +
    NAMA_BULAN[tanggal.getMonth()] + " " +
    tanggal.getFullYear()
  );
}

// Menghitung sisa hari antara deadline dan hari ini.
// Keduanya dibandingkan sebagai tanggal kalender pukul 00.00 waktu lokal.
function hitungSisaHari(teksDeadline) {
  const deadline = parseTanggal(teksDeadline);

  if (deadline === null) {
    return null;
  }

  const sekarang = new Date();
  const hariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());

  // Date.UTC dipakai hanya untuk menghitung jumlah hari dengan tepat,
  // agar selisih tetap bulat meskipun ada pergantian waktu (DST).
  const satuHari = 24 * 60 * 60 * 1000;
  const hariIniUtc = Date.UTC(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate());
  const deadlineUtc = Date.UTC(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

  return Math.round((deadlineUtc - hariIniUtc) / satuHari);
}

// ------------------------------------------------------------
// Status dan pengurutan
// ------------------------------------------------------------

// Menentukan teks badge dan kelas warna untuk satu tugas.
function tentukanStatus(tugas) {
  if (tugas.selesai) {
    return { teks: "Selesai", kelas: "status-selesai" };
  }

  const sisa = hitungSisaHari(tugas.deadline);

  if (sisa < 0) {
    return { teks: "Terlewat " + Math.abs(sisa) + " hari", kelas: "status-terlewat" };
  }
  if (sisa === 0) {
    return { teks: "Deadline hari ini", kelas: "status-mendesak" };
  }
  if (sisa === 1) {
    return { teks: "Besok", kelas: "status-mendesak" };
  }
  if (sisa <= BATAS_MENDESAK_HARI) {
    return { teks: sisa + " hari lagi", kelas: "status-mendesak" };
  }
  return { teks: sisa + " hari lagi", kelas: "status-aman" };
}

// Membandingkan dua tugas untuk pengurutan:
// 1. Tugas yang belum selesai selalu di atas.
// 2. Deadline lebih dekat tampil lebih dulu.
// 3. Jika deadline sama, id lebih kecil tampil lebih dulu.
function bandingkanTugas(a, b) {
  if (a.selesai !== b.selesai) {
    return a.selesai ? 1 : -1;
  }

  // Format YYYY-MM-DD bisa dibandingkan langsung sebagai teks.
  if (a.deadline < b.deadline) {
    return -1;
  }
  if (a.deadline > b.deadline) {
    return 1;
  }

  return a.id - b.id;
}

// Mengurutkan tugas dengan perulangan sederhana: bandingkan dua tugas
// yang bersebelahan, lalu tukar posisinya bila urutannya salah.
function urutkanTugas() {
  for (let i = 0; i < daftarTugas.length - 1; i++) {
    for (let j = 0; j < daftarTugas.length - 1 - i; j++) {
      if (bandingkanTugas(daftarTugas[j], daftarTugas[j + 1]) > 0) {
        const sementara = daftarTugas[j];
        daftarTugas[j] = daftarTugas[j + 1];
        daftarTugas[j + 1] = sementara;
      }
    }
  }
}

// ------------------------------------------------------------
// Tampilan
// ------------------------------------------------------------

// Memperbarui teks ringkasan di bawah judul.
function perbaruiRingkasan() {
  if (daftarTugas.length === 0) {
    elemenRingkasan.textContent = "Belum ada tugas.";
    return;
  }

  let jumlahBelumSelesai = 0;
  let jumlahTerlewat = 0;

  for (let i = 0; i < daftarTugas.length; i++) {
    const tugas = daftarTugas[i];

    if (tugas.selesai === false) {
      jumlahBelumSelesai = jumlahBelumSelesai + 1;

      if (hitungSisaHari(tugas.deadline) < 0) {
        jumlahTerlewat = jumlahTerlewat + 1;
      }
    }
  }

  if (jumlahBelumSelesai === 0) {
    elemenRingkasan.textContent = "Semua tugas sudah selesai.";
  } else if (jumlahTerlewat > 0) {
    elemenRingkasan.textContent =
      jumlahBelumSelesai + " tugas belum selesai, " +
      jumlahTerlewat + " di antaranya terlewat.";
  } else {
    elemenRingkasan.textContent = jumlahBelumSelesai + " tugas belum selesai.";
  }
}

// Memeriksa apakah tugas lolos filter yang sedang aktif.
function lolosFilter(tugas) {
  if (filterAktif === "belum") {
    return tugas.selesai === false;
  }
  if (filterAktif === "selesai") {
    return tugas.selesai === true;
  }
  return true;
}

// Membuat satu elemen <li> untuk sebuah tugas.
function buatItemTugas(tugas) {
  const status = tentukanStatus(tugas);

  const item = document.createElement("li");
  item.className = "item-tugas " + status.kelas;

  const kotak = document.createElement("input");
  kotak.type = "checkbox";
  kotak.className = "kotak-selesai";
  kotak.id = "tugas-" + tugas.id;
  kotak.checked = tugas.selesai;
  kotak.setAttribute(
    "aria-label",
    (tugas.selesai ? "Batalkan selesai: " : "Tandai selesai: ") + tugas.nama
  );
  kotak.addEventListener("change", function () {
    ubahStatusSelesai(tugas.id);
  });

  const isi = document.createElement("div");
  isi.className = "isi-tugas";

  // Nama tugas juga menjadi label checkbox, sehingga teks nama bisa
  // diklik untuk menandai selesai atau membatalkannya.
  const nama = document.createElement("label");
  nama.className = "nama-tugas";
  nama.setAttribute("for", kotak.id);
  nama.textContent = tugas.nama;

  const meta = document.createElement("div");
  meta.className = "meta-tugas";

  const tanggal = document.createElement("span");
  tanggal.className = "tanggal-tugas";
  tanggal.textContent = formatTanggalIndonesia(tugas.deadline);

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = status.teks;

  // Label mata kuliah hanya dibuat jika tugas punya mata kuliah.
  const mataKuliah = cariMataKuliah(tugas.mataKuliah);

  if (mataKuliah !== null) {
    const chip = document.createElement("span");
    chip.className = "chip-matkul mk-" + mataKuliah.id;

    const titik = document.createElement("span");
    titik.className = "titik";

    const namaMatkul = document.createElement("span");
    namaMatkul.textContent = mataKuliah.nama;

    // Tanda kurung membuat kode tetap terbaca terpisah oleh pembaca
    // layar, bukan menempel pada nama mata kuliah.
    const kode = document.createElement("span");
    kode.className = "kode-matkul";
    kode.textContent = "(" + mataKuliah.kode + ")";

    chip.appendChild(titik);
    chip.appendChild(namaMatkul);
    chip.appendChild(kode);
    meta.appendChild(chip);
  }

  meta.appendChild(tanggal);
  meta.appendChild(badge);
  isi.appendChild(nama);
  isi.appendChild(meta);

  const tombolHapus = document.createElement("button");
  tombolHapus.type = "button";
  tombolHapus.className = "tombol-hapus";
  tombolHapus.id = "hapus-" + tugas.id;
  tombolHapus.textContent = "Hapus";
  tombolHapus.setAttribute("aria-label", "Hapus tugas: " + tugas.nama);
  tombolHapus.addEventListener("click", function () {
    hapusTugas(tugas.id);
  });

  item.appendChild(kotak);
  item.appendChild(isi);
  item.appendChild(tombolHapus);

  return item;
}

// Menampilkan daftar tugas sesuai filter dan pesan kondisi kosong.
function perbaruiDaftar() {
  // textContent dipakai untuk mengosongkan daftar agar tidak ada
  // HTML dari data pengguna yang ikut dijalankan.
  elemenDaftar.textContent = "";
  elemenPesanKosong.textContent = "";

  let jumlahTampil = 0;

  for (let i = 0; i < daftarTugas.length; i++) {
    const tugas = daftarTugas[i];

    if (lolosFilter(tugas)) {
      elemenDaftar.appendChild(buatItemTugas(tugas));
      jumlahTampil = jumlahTampil + 1;
    }
  }

  if (jumlahTampil > 0) {
    return;
  }

  // Pesan kondisi kosong mengikuti filter yang sedang aktif.
  if (filterAktif === "belum") {
    elemenPesanKosong.textContent = "Semua tugas sudah selesai.";
  } else if (filterAktif === "selesai") {
    elemenPesanKosong.textContent = "Belum ada tugas yang selesai.";
  } else {
    elemenPesanKosong.textContent =
      "Belum ada tugas. Isi form di atas untuk menambahkan tugas pertama.";
  }
}

// Menandai tombol filter yang sedang aktif.
function perbaruiTombolFilter() {
  for (let i = 0; i < tombolFilter.length; i++) {
    const tombol = tombolFilter[i];
    const nilai = tombol.getAttribute("data-filter");

    if (nilai === filterAktif) {
      tombol.setAttribute("aria-pressed", "true");
    } else {
      tombol.setAttribute("aria-pressed", "false");
    }
  }
}

// Menampilkan tombol hapus semua hanya jika ada tugas yang selesai.
function perbaruiTombolHapusSelesai() {
  let adaYangSelesai = false;

  for (let i = 0; i < daftarTugas.length; i++) {
    if (daftarTugas[i].selesai === true) {
      adaYangSelesai = true;
      break;
    }
  }

  tombolHapusSelesai.hidden = !adaYangSelesai;
}

// Memperbarui seluruh tampilan setelah data berubah.
function perbaruiTampilan() {
  urutkanTugas();
  perbaruiRingkasan();
  perbaruiTombolFilter();
  perbaruiDaftar();
  perbaruiTombolHapusSelesai();
}

// ------------------------------------------------------------
// Aksi pengguna
// ------------------------------------------------------------

// Membuat id baru: id terbesar yang ada ditambah satu.
function buatIdBaru() {
  let idTerbesar = 0;

  for (let i = 0; i < daftarTugas.length; i++) {
    if (daftarTugas[i].id > idTerbesar) {
      idTerbesar = daftarTugas[i].id;
    }
  }

  return idTerbesar + 1;
}

// Menghapus penanda error pada input yang bisa menampilkan error.
function bersihkanTandaError() {
  const daftarInput = [inputNama, inputDeadline, inputMataKuliah];

  for (let i = 0; i < daftarInput.length; i++) {
    daftarInput[i].removeAttribute("aria-invalid");
    daftarInput[i].removeAttribute("aria-describedby");
  }
}

// Menampilkan pesan error dan memindahkan fokus ke input terkait.
function tampilkanError(pesan, elemenFokus) {
  bersihkanTandaError();
  elemenPesanError.textContent = pesan;
  elemenFokus.setAttribute("aria-invalid", "true");
  elemenFokus.setAttribute("aria-describedby", "pesan-error");
  elemenFokus.focus();
}

// Menghapus pesan error dari layar.
function sembunyikanError() {
  bersihkanTandaError();
  elemenPesanError.textContent = "";
}

// Menangani form saat tombol Simpan tugas ditekan atau Enter ditekan.
function tambahTugas(event) {
  event.preventDefault();

  let nama = inputNama.value.trim();
  const deadline = inputDeadline.value;

  // Pilihan mata kuliah dibaca sebagai teks, lalu diubah ke angka.
  // String kosong berarti tugas tanpa mata kuliah (0).
  let mataKuliah = 0;

  if (inputMataKuliah.value !== "") {
    mataKuliah = Number(inputMataKuliah.value);
  }

  if (nama === "") {
    tampilkanError("Nama tugas belum diisi.", inputNama);
    return;
  }

  if (deadline === "") {
    tampilkanError("Pilih tanggal deadline terlebih dahulu.", inputDeadline);
    return;
  }

  if (parseTanggal(deadline) === null) {
    tampilkanError("Tanggal deadline tidak valid.", inputDeadline);
    return;
  }

  if (mataKuliah !== 0 && cariMataKuliah(mataKuliah) === null) {
    tampilkanError("Pilih mata kuliah yang tersedia.", inputMataKuliah);
    return;
  }

  // maxlength sudah membatasi ketikan, tetapi data tetap dipotong di sini
  // agar nama tidak lebih dari 80 karakter.
  if (nama.length > 80) {
    nama = nama.slice(0, 80);
  }

  // Periksa dengan aturan yang sama seperti saat membaca penyimpanan,
  // sehingga tugas yang baru ditambahkan selalu lolos saat dimuat ulang.
  const tugasBaru = {
    id: buatIdBaru(),
    nama: nama,
    deadline: deadline,
    selesai: false,
    mataKuliah: mataKuliah
  };

  if (itemTugasValid(tugasBaru) === false) {
    tampilkanError("Tanggal deadline tidak valid.", inputDeadline);
    return;
  }

  sembunyikanError();

  daftarTugas.push(tugasBaru);

  simpanTugas();

  inputNama.value = "";
  inputDeadline.value = "";
  inputMataKuliah.value = "";

  perbaruiTampilan();
  inputNama.focus();
}

// Menandai tugas selesai, atau membatalkan tanda selesai.
function ubahStatusSelesai(id) {
  for (let i = 0; i < daftarTugas.length; i++) {
    if (daftarTugas[i].id === id) {
      daftarTugas[i].selesai = !daftarTugas[i].selesai;
      break;
    }
  }

  simpanTugas();
  perbaruiTampilan();

  // Daftar digambar ulang, sehingga elemen checkbox lama ikut terhapus.
  // Kembalikan fokus ke checkbox tugas yang sama agar pengguna keyboard
  // tidak kehilangan posisinya.
  const kotak = document.getElementById("tugas-" + id);

  if (kotak !== null) {
    kotak.focus();
  } else {
    // Tugas tidak lagi tampil karena filter aktif. Pindahkan fokus ke
    // tombol filter yang sedang dipakai agar pengguna keyboard tidak
    // terlempar ke awal halaman.
    const tombolAktif = document.querySelector(".tombol-filter[aria-pressed='true']");

    if (tombolAktif !== null) {
      tombolAktif.focus();
    }
  }
}

// Menghapus satu tugas berdasarkan id.
function hapusTugas(id) {
  // Catat posisi tugas yang dihapus agar fokus bisa dipindahkan ke
  // tugas berikutnya setelah daftar digambar ulang.
  let posisi = 0;

  for (let i = 0; i < daftarTugas.length; i++) {
    if (daftarTugas[i].id === id) {
      posisi = i;
      break;
    }
  }

  const sisa = [];

  for (let i = 0; i < daftarTugas.length; i++) {
    if (daftarTugas[i].id !== id) {
      sisa.push(daftarTugas[i]);
    }
  }

  daftarTugas = sisa;
  simpanTugas();
  perbaruiTampilan();

  if (daftarTugas.length === 0) {
    inputNama.focus();
    return;
  }

  // Jika tugas terakhir yang dihapus, pakai tugas terakhir yang tersisa.
  if (posisi > daftarTugas.length - 1) {
    posisi = daftarTugas.length - 1;
  }

  const tombolBerikut = document.getElementById("hapus-" + daftarTugas[posisi].id);

  if (tombolBerikut !== null) {
    tombolBerikut.focus();
  } else {
    inputNama.focus();
  }
}

// Menghapus semua tugas yang sudah selesai.
function hapusSemuaSelesai() {
  const sisa = [];

  for (let i = 0; i < daftarTugas.length; i++) {
    if (daftarTugas[i].selesai === false) {
      sisa.push(daftarTugas[i]);
    }
  }

  daftarTugas = sisa;
  simpanTugas();
  perbaruiTampilan();
  inputNama.focus();
}

// Mengganti filter yang aktif.
function aturFilter(filter) {
  filterAktif = filter;
  perbaruiTampilan();
}

// ------------------------------------------------------------
// Menyiapkan aplikasi
// ------------------------------------------------------------

// Mengisi pilihan mata kuliah pada form dari daftar MATA_KULIAH.
function isiPilihanMataKuliah() {
  for (let i = 0; i < MATA_KULIAH.length; i++) {
    const mataKuliah = MATA_KULIAH[i];

    const pilihan = document.createElement("option");
    pilihan.value = String(mataKuliah.id);
    pilihan.textContent = mataKuliah.nama + " (" + mataKuliah.kode + ")";

    inputMataKuliah.appendChild(pilihan);
  }
}

// Memasang semua event listener.
function pasangEvent() {
  formTugas.addEventListener("submit", tambahTugas);
  tombolHapusSelesai.addEventListener("click", hapusSemuaSelesai);

  for (let i = 0; i < tombolFilter.length; i++) {
    const tombol = tombolFilter[i];

    tombol.addEventListener("click", function () {
      aturFilter(tombol.getAttribute("data-filter"));
    });
  }

  // Sisa hari dihitung dari tanggal hari ini. Jika halaman dibiarkan
  // terbuka melewati tengah malam, badge dan ringkasan bisa kedaluwarsa.
  // Perbarui tampilan saat pengguna kembali ke tab ini.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      perbaruiTampilan();
    }
  });
}

// Memulai aplikasi: muat data, pasang event, lalu tampilkan.
function mulai() {
  daftarTugas = bacaPenyimpanan();
  isiPilihanMataKuliah();
  pasangEvent();
  perbaruiTampilan();
}

mulai();
