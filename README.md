# 🏦 FinanceCore - Enterprise Financial Recording System

FinanceCore adalah platform manajemen keuangan berbasis **JAMStack** yang dirancang untuk pencatatan transaksi kas perusahaan secara transparan. Sistem ini menggunakan arsitektur *Serverless*, memungkinkan performa tinggi tanpa biaya pemeliharaan server fisik.

## ✨ Fitur Utama
* **Real-time Dashboard**: Visualisasi arus kas dengan Chart.js.
* **Cloud Receipt Storage**: Unggah bukti transaksi (struk) langsung ke Cloudinary.
* **Automatic Cleanup**: Menghapus file gambar di Cloudinary secara otomatis saat data transaksi dihapus di database.
* **Audit-Ready Reporting**: Export ke CSV dan fitur cetak laporan PDF bulanan/tahunan yang rapi.
* **Granular Security**: Akses kontrol berbasis Role (RBAC) menggunakan Netlify Identity.
* **Responsive Design**: Antarmuka modern menggunakan Tailwind CSS yang optimal di perangkat mobile maupun desktop.

---

## 🛠️ Persiapan Lingkungan (Prasyarat)

Sebelum melakukan instalasi, Anda wajib menyiapkan 3 layanan berikut:

1.  **MongoDB Atlas**:
    * Buat Cluster gratis.
    * Buat Database dengan nama `finance_db` (atau nama lain).
    * Dapatkan **Connection String** (Contoh: `mongodb+srv://user:pass@cluster0.mongodb.net/`).
2.  **Cloudinary**:
    * Dapatkan `Cloud Name`, `API Key`, dan `API Secret` dari Dashboard.
    * Pergi ke **Settings > Upload**.
    * Scroll ke bawah ke **Upload Presets**, klik **Add Upload Preset**.
    * Atur **Signing Mode** menjadi `Unsigned`.
    * Beri nama preset tersebut (Contoh: `finance_preset`).
3.  **Netlify**:
    * Siapkan akun untuk hosting dan eksekusi Serverless Functions.

---

## 🚀 Panduan Instalasi & Konfigurasi

### 1. Clone Repository
Buka terminal dan jalankan:
```bash
git clone https://github.com/IshikawaUta/finance-company.git
cd finance-company

```

### 2. Hubungkan ke Netlify

1. Push kode Anda ke repository GitHub.
2. Masuk ke Netlify, pilih **Add New Site** > **Import from GitHub**.
3. Pilih repository `finance-core`.

### 3. Konfigurasi Environment Variables (Penting!)

Di Dashboard Netlify, navigasi ke **Site Settings > Environment Variables**. Masukkan 4 kunci berikut agar fitur Database dan Cloudinary berfungsi:

| Key | Value / Contoh |
| --- | --- |
| `MONGODB_URI` | `mongodb+srv://admin:password@cluster.mongodb.net/finance_db` |
| `CLOUDINARY_CLOUD_NAME` | `dzsqaauqn` |
| `CLOUDINARY_API_KEY` | `123456789012345` |
| `CLOUDINARY_API_SECRET` | `AbCdEfG123456789` |

### 4. Sinkronisasi Kode Frontend

Buka file `admin/index.html` dan pastikan variabel berikut sudah sesuai dengan akun Cloudinary Anda:

```javascript
const CLOUDINARY_URL = "[https://api.cloudinary.com/v1_1/NAMA_CLOUD_ANDA/image/upload](https://api.cloudinary.com/v1_1/NAMA_CLOUD_ANDA/image/upload)";
const CLOUDINARY_PRESET = "NAMA_PRESET_UNSIGNED_ANDA";
```

### 5. Pengamanan Halaman Admin (Netlify Identity)

1. Buka tab **Identity** di Netlify, klik **Enable Identity**.
2. Di **Settings > Registration**, ubah menjadi **Invite Only**.
3. Undang email Anda sendiri.
4. Setelah Anda konfirmasi email, kembali ke Dashboard Netlify Identity.
5. Klik pada Nama/Email Anda, pilih **Edit Settings**, dan pada kolom **Roles**, ketik `admin` lalu simpan.

---

## 📂 Struktur Proyek

```text
├── admin/
│   ├── index.html       # Dashboard Utama & Input Data
│   ├── report.html      # Template Laporan PDF (Format Cetak)
│   └── profile.html     # Pengaturan Profil User
├── api/                 # Netlify Serverless Functions (Backend)
│   ├── get-data.js      # Mengambil data dengan filter
│   ├── add-data.js      # Menambah transaksi & URL gambar
│   ├── update-data.js   # Memperbarui data transaksi
│   └── delete-data.js   # Menghapus data di DB & File di Cloudinary
├── index.html           # Landing Page & Portal Login
└── README.md            # Dokumentasi Teknis
```

---

## 📊 Prosedur Operasional

### Menambah Transaksi

1. Isi Keterangan, Jumlah, dan Tipe (Masuk/Keluar).
2. Klik **Bukti Struk** untuk mengunggah gambar (Opsional).
3. Klik **Simpan Transaksi**.

### Mencetak Laporan PDF

1. Gunakan Filter **Bulan** dan **Tahun** di dashboard.
2. Klik tombol **Print PDF**.
3. Halaman akan berpindah ke mode laporan. Tekan `Ctrl + P` atau tombol Print.
4. **Penting**: Pada pengaturan print browser, centang **Background Graphics** agar warna tabel dan grafik muncul.

---

## 🛠️ Pengembangan Lokal (Optional)

Jika ingin melakukan modifikasi secara lokal, instal **Netlify CLI**:

```bash
npm install netlify-cli -g
netlify dev
```

Perintah ini akan menjalankan server lokal yang mensimulasikan Netlify Functions di `localhost:8888`.

---

## ⚖️ Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Anda bebas menggunakan dan memodifikasi untuk keperluan pribadi maupun komersial.

---

**FinanceCore** - *The Future of Transparent Corporate Finance.*

### Langkah Terakhir untuk Anda:
Pastikan Anda membuat file bernama `.gitignore` di folder utama proyek dan masukkan baris berikut:
```text
node_modules/
.netlify/
.env
```

Ini berfungsi agar file sampah atau file rahasia tidak ikut ter-upload ke GitHub publik.