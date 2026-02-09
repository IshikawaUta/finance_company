const { MongoClient } = require('mongodb');

// Menggunakan Global Cache untuk koneksi database (Performa lebih kencang)
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event, context) => {
  // 1. Keamanan: Cek Login & Role Admin
  const { user } = context.clientContext;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const roles = user.app_metadata.roles || [];
  if (!roles.includes('admin')) {
    return { statusCode: 403, body: JSON.stringify({ error: "Akses Ditolak: Khusus Admin" }) };
  }

  try {
    const client = await connectToDatabase();
    const db = client.db("finance_company_db");

    // 2. Ambil Data dengan Sorting
    // Kita urutkan berdasarkan tanggal (date) terbaru di posisi teratas
    const transactions = await db.collection("transactions")
      .find({})
      .sort({ date: -1 }) 
      .toArray();

    // 3. Kembalikan Response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // Mencegah cache browser agar data selalu fresh setelah input baru
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify(transactions)
    };

  } catch (err) {
    console.error("Database Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Gagal mengambil data dari database" })
    };
  }
  // Tidak menutup koneksi (client.close) agar bisa dipakai lagi oleh request berikutnya
};