# Inventory Management API

REST API sederhana untuk sistem manajemen inventaris barang. 

## Teknologi

| Komponen | Pilihan | Alasan singkat |
|---|---|---|
| Framework | Express.js | Minimalis, dokumentasi dan komunitas besar, struktur folder dapat diatur sendiri |
| Database | PostgreSQL (Supabase) | Data inventaris terstruktur dan berelasi, mendukung constraint dan integritas data |
| ORM | Prisma | Skema terpusat, query type-safe, dan query berparameter yang terlindung dari SQL injection |
| Validasi | Zod | Satu skema untuk tipe dan aturan input, dengan pesan error yang jelas |
| Autentikasi | JWT + bcrypt | API stateless, dan password disimpan dalam bentuk hash |

**Asumsi:** setiap user hanya dapat melihat dan mengelola barang miliknya sendiri.

## Instalasi dan Menjalankan Proyek

### Prasyarat
- Node.js 18 atau lebih baru (beserta npm)
- Database PostgreSQL (lokal, atau proyek Supabase gratis)

### Langkah-langkah

1. **Clone repository dan masuk ke folder backend**
   ```bash
   git clone https://github.com/USERNAME/NAMA-REPO.git
   cd NAMA-REPO/backend
   ```

2. **Install dependency**
   ```bash
   npm install
   ```

3. **Siapkan environment variable.** Salin `.env.example` menjadi `.env`, lalu isi nilainya.
   ```bash
   # Windows (CMD)
   copy .env.example .env
   # macOS / Linux
   cp .env.example .env
   ```

   | Variabel | Keterangan |
   |---|---|
   | `DATABASE_URL` | Connection string database untuk aplikasi (jika memakai Supabase: pooler, port 6543, tambahkan `?pgbouncer=true`) |
   | `DIRECT_URL` | Connection string langsung untuk Prisma CLI (port 5432). Jika memakai Postgres lokal, isi sama dengan `DATABASE_URL` |
   | `JWT_SECRET` | Kunci rahasia penanda tangan token JWT, berupa string acak yang panjang |
   | `PORT` | Port server (default 3000) |

   Contoh membuat `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. **Buat tabel di database.** Jalankan isi file `init.sql` pada database. Untuk Supabase, buka *SQL Editor*, tempel isi `init.sql`, lalu klik *Run*. Untuk Postgres lokal:
   ```bash
   psql -U postgres -d NAMA_DATABASE -f init.sql
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Jalankan server**
   ```bash
   npm run dev     # mode development (auto-restart dengan nodemon)
   npm start       # mode biasa
   ```
   Server berjalan di `http://localhost:3000`. Untuk memastikan server hidup, akses `GET http://localhost:3000/health`.

### Dokumentasi API (Postman)
Import file `docs/NAMA-FILE.postman_collection.json` ke Postman (*Import* → pilih file). Setelah login, isi token di tab *Authorization* pada collection (tipe *Bearer Token*).

## Dokumentasi Endpoint

Base URL: `http://localhost:3000`

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| GET | `/health` | Tidak | Cek server hidup |
| POST | `/auth/register` | Tidak | Daftar akun baru |
| POST | `/auth/login` | Tidak | Login dan mendapat token JWT |
| POST | `/items` | Ya | Tambah barang |
| GET | `/items` | Ya | Daftar barang (search dan pagination) |
| PUT | `/items/:id` | Ya | Ubah data barang |
| DELETE | `/items/:id` | Ya | Hapus barang |

Endpoint bertanda "Ya" wajib menyertakan header `Authorization: Bearer <token>`.

### POST /auth/register
Request body:
```json
{ "name": "Zaky", "email": "zaky@gmail.com", "password": "zaky123" }
```
Response `201`:
```json
{
  "message": "Registrasi berhasil",
  "data": { "id": 1, "name": "Zaky", "email": "zaky@gmail.com", "createdAt": "2026-11-05T08:00:00.000Z" }
}
```
Aturan: nama 2-100 karakter, email valid, password 8-72 karakter. Email yang sudah terdaftar menghasilkan `409`.

### POST /auth/login
Request body:
```json
{ "email": "zaky@gmail.com", "password": "rahasia123" }
```
Response `200`:
```json
{
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "name": "Zaky", "email": "zaky@gmail.com" }
  }
}
```
Email atau password salah menghasilkan `401`. Token berlaku 1 hari.

### POST /items
Request body:
```json
{ "name": "Kabel USB", "description": "1 meter", "stock": 25, "price": 15000 }
```
Response `201`:
```json
{
  "message": "Barang berhasil ditambahkan",
  "data": {
    "id": 1, "name": "Kabel USB", "description": "1 meter",
    "stock": 25, "price": "15000",
    "createdAt": "2026-11-05T08:10:00.000Z", "updatedAt": "2026-11-05T08:10:00.000Z",
    "userId": 1
  }
}
```
Aturan: `stock` bilangan bulat >= 0, `price` >= 0. Catatan: `price` dikembalikan sebagai string agar presisi desimal terjaga.

### GET /items
Query parameter (semua opsional):

| Parameter | Default | Keterangan |
|---|---|---|
| `search` | - | Mencari pada nama dan deskripsi (tidak peka huruf besar/kecil) |
| `page` | 1 | Nomor halaman |
| `limit` | 10 | Jumlah data per halaman (maksimal 100) |

Contoh: `GET /items?search=kabel&page=1&limit=5`

Response `200`:
```json
{
  "data": [ { "id": 1, "name": "Kabel USB", "stock": 25, "price": "15000" } ],
  "meta": { "page": 1, "limit": 5, "totalItems": 1, "totalPages": 1 }
}
```

### PUT /items/:id
Semua field opsional, tetapi minimal satu harus dikirim.
```json
{ "stock": 40 }
```
Response `200`: `{ "message": "Barang berhasil diperbarui", "data": { ... } }`. Barang yang tidak ada atau milik user lain menghasilkan `404`.

### DELETE /items/:id
Response `200`: `{ "message": "Barang berhasil dihapus" }`. Barang yang tidak ada atau milik user lain menghasilkan `404`.

### Format Error

| Status | Arti |
|---|---|
| `400` | Validasi gagal |
| `401` | Token tidak ada, tidak valid, atau kedaluwarsa (atau login gagal) |
| `404` | Data atau endpoint tidak ditemukan |
| `409` | Konflik (misalnya email sudah terdaftar) |
| `500` | Kesalahan server |

Contoh respons `400`:
```json
{
  "message": "Validasi gagal",
  "errors": [ { "field": "stock", "message": "Stok tidak boleh negatif" } ]
}
```

## Understanding Questions

### 1. Alur Request

```
Client → Router → Auth (JWT) → Validasi (Zod) → Controller → Prisma Client → PostgreSQL
```

Pada saat client mengirim request, Router mencocokkan method dan path-nya ke endpoint tujuan. Untuk endpoint `/items`, request lebih dulu lewat middleware auth yang memverifikasi token JWT, kemudian middleware validasi yang memeriksa input dengan Zod. Hanya request yang lolos kedua tahap tadi yang diteruskan ke Controller, yang menjalankan logika aplikasi dan berinteraksi dengan database melalui Prisma Client. Endpoint `/auth/register` dan `/auth/login` tidak memakai autentikasi karena pemanggilnya belum mempunyai token, tetapi inputnya tetap divalidasi.

Alasan pemisahan logika: autentikasi, validasi, dan logika aplikasi berada pada bagian masing-masing. Controller hanya menerima data yang sudah bersih dan membaca identitas user dari `req.user`, jadi aturan baru cukup ditambahkan di satu tempat tanpa mengubah bagian lainnya.

### 2. Penyimpanan Token JWT

Untuk penyimpanan token JWT di web, HttpOnly Cookie lebih baik dibanding localStorage karena token tidak dapat dibaca langsung oleh JavaScript. Jika disimpan di localStorage, token bisa diakses oleh JavaScript sehingga dapat dicuri apabila web terkena serangan XSS. Cookie juga dapat diatur atribut `Secure` dan `SameSite` untuk meningkatkan keamanan, termasuk mengurangi risiko CSRF.

Pada implementasi tes ini, token dikembalikan di body response login dan dikirim client lewat header `Authorization: Bearer`, supaya mudah diuji dengan Postman dan dipakai oleh berbagai jenis client. Untuk aplikasi web yang sesungguhnya, token akan dipindahkan ke HttpOnly Cookie dengan atribut `Secure` dan `SameSite`.

### 3. Penanganan Konkurensi

Jika dua user bersamaan mengurangi stok barang yang tinggal 1, pendekatan "baca stok, cek, lalu kurangi" bisa gagal: keduanya membaca stok = 1, keduanya lolos pengecekan, lalu keduanya mengurangi sehingga stok menjadi -1 (*race condition*).

Solusinya adalah atomic update, yaitu pemeriksaan stok dan pengurangan dilakukan dalam satu operasi:

```js
const result = await prisma.item.updateMany({
  where: { id, stock: { gte: qty } },
  data: { stock: { decrement: qty } },
});
if (result.count === 0) return res.status(409).json({ message: "Stok tidak mencukupi" });
```

Perintah ini dijalankan database sebagai satu statement SQL, jadi pengecekan stok dan pengurangannya terjadi sekaligus. Waktu dua request masuk bersamaan, PostgreSQL mengunci baris barang itu, sehingga request kedua menunggu yang pertama selesai dulu. Saat giliran request kedua, stoknya sudah 0 dan syarat `stock >= qty` tidak terpenuhi, jadi ia ditolak dengan status 409 dan datanya tidak berubah.