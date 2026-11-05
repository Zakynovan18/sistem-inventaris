Cara menjalankan project di Lokal

1. Pastikan sudah tersedia Node.js, NPM, dan PostgreSQL/supabase.
2. Clone repository dan masuk ke directory project.
3. Jalankan npm install untuk menginstal dependencies.
4. Buat file .env dengan menyesuaikan .env.example, kemudian isi konfigurasi koneksi database dan JWT Secret.
5. Siapkan database PostgreSQL, apabila menggunakan database baru, jalankan file init.sql melalui SQL editor Supabase atau PostgreSQL.
6. Jalankan npx prisma generate untuk menghasilkan Prisma Client.
7. Jalankan aplikasi dengan npm run dev.
8. Setelah bisa berjalan, API dapat diakses melalui http://localhost:300,
untuk menguji server berjalan, akses endpoint GET atau HEALTH.


Understanding Questions
1. Alur Request 
Client → Router → Auth (JWT) → Validasi (Zod) → Controller → Prisma Client → PostgreSQL.
Pada saat client mengirim request, Router mencocokkan method dam path nya ke endpoint tujuan, untuk Endpoint, request lebih dulu lewat midldleware auth yang memverifikasi token JWT. Kemudian middleware validasi yang memriksa input dengan zod. Hanya req yang lolos kedua tahap tadi yang diteruskan ke controller yang nantinya menjalankan logika aplikasi dan berinteraksi dengan database melalui Prisma Client.  Endpoint untuk auth login dan register tidak memakai autentikasi karena pemanggil belum mempunyai token, tetapi inputnya tetep divalidasi.
Alasan pemisahan logic karena Autentikasi, validasi, dan juga logika berada pada bagian masing - masing. Controller hanya menerima data yang sudah clean dan membaca identitas dari req.user, jadi aturan baru cukup ditambahkan di suatu tempat tanpa ubah bagian lainya.

2. Untuk penyimpanan token JWT, HttpOnly Cookie lebih baik dibanding local storage untuk web karena token tidak terbaca secara langsung oleh js. Jika di local, token bisa diakses oleh js yang bisa dicuri apabila web terkena serangan. Cookie juga bisa mengubah atribut secure dan samesite untuk peningkatan keamanan.

3. Jika dua user bersamaan mengurangi stok barang yang tinggal 1, untuk menecegah agat tidak negatif, saya memakai atomic update dengan pemeriksaan stok dan pengurangan dilakukan dalam satu operasi: 

const result = await prisma.item.updateMany({
  where: { id, stock: { gte: qty } },
  data: { stock: { decrement: qty } },
});
if (result.count === 0) return res.status(409).json({ message: "Stok tidak mencukupi" });

Perintah ini dijalankan database sebagai satu statement SQL, jadi pengecekan stok dan pengurangannya terjadi sekaligus. Waktu dua request masuk bersama, PostgreSQL mengunci baris barang itu, jadi request kedua menunggu yang pertama selesai dulu. Saat request kedua, stoknya sudah 0 dan syarat `stock >= qty` tidak terpenuhi, jadi dia ditolak dengan status 409 dan datanya tidak berubah.