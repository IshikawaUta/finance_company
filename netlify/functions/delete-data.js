const { MongoClient, ObjectId } = require('mongodb');
const cloudinary = require('cloudinary').v2;

// Konfigurasi Cloudinary menggunakan Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event, context) => {
  // 1. Keamanan Sisi Server (Auth & Role Check)
  const { user } = context.clientContext;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const roles = user.app_metadata.roles || [];
  if (!roles.includes('admin')) {
    return { statusCode: 403, body: JSON.stringify({ error: "Akses Ditolak: Hanya Admin yang boleh menghapus data" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { id } = JSON.parse(event.body);
    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "ID Transaksi diperlukan" }) };
    }

    const client = await connectToDatabase();
    const db = client.db("finance_company_db");

    // 2. Ambil data transaksi sebelum dihapus untuk mengecek file gambar
    const transaction = await db.collection("transactions").findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      return { statusCode: 404, body: JSON.stringify({ error: "Data tidak ditemukan" }) };
    }

    // 3. Proses Penghapusan Gambar di Cloudinary jika ada
    if (transaction.receipt && transaction.receipt.includes("cloudinary.com")) {
      try {
        // Ekstrak Public ID dari URL: .../v12345/public_id.jpg
        const urlParts = transaction.receipt.split('/');
        const fileWithExtension = urlParts[urlParts.length - 1]; // "abcd123.jpg"
        const publicId = fileWithExtension.split('.')[0]; // "abcd123"

        await cloudinary.uploader.destroy(publicId);
        console.log(`Cloudinary image deleted: ${publicId}`);
      } catch (cloudErr) {
        console.error("Cloudinary Delete Error (Skipped):", cloudErr);
        // Kita lanjutkan proses hapus DB meskipun Cloudinary gagal agar DB tidak stuck
      }
    }

    // 4. Eksekusi Penghapusan di MongoDB
    const result = await db.collection("transactions").deleteOne({ 
      _id: new ObjectId(id) 
    });

    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: "Data dan bukti gambar berhasil dihapus", id }) 
    };

  } catch (err) {
    console.error("Global Delete Error:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Terjadi kesalahan pada server" }) 
    };
  }
};