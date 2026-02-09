const { MongoClient } = require('mongodb');

// Optimasi: Connection Pooling
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event, context) => {
  // 1. Validasi Auth & Role
  const { user } = context.clientContext;
  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const roles = user.app_metadata.roles || [];
  if (!roles.includes('admin')) {
    return { statusCode: 403, body: JSON.stringify({ error: "Forbidden: Admin role required" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const client = await connectToDatabase();
    const db = client.db("finance_company_db");

    // 2. Mapping Data & Sanitasi (Termasuk Field Receipt Baru)
    const newTransaction = {
      desc: data.desc || "Tanpa keterangan",
      amount: parseFloat(data.amount),
      type: data.type, // 'income' atau 'expense'
      date: data.date ? new Date(data.date) : new Date(),
      // --- UPDATE DISINI ---
      receipt: data.receipt || "", // Menyimpan URL gambar dari Cloudinary
      // ----------------------
      createdAt: new Date(),
      userId: user.sub, 
      userEmail: user.email
    };

    // 3. Validasi Input
    if (isNaN(newTransaction.amount)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Jumlah harus berupa angka" }) };
    }

    await db.collection("transactions").insertOne(newTransaction);

    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: "Transaksi & Bukti berhasil disimpan", data: newTransaction }) 
    };

  } catch (err) {
    console.error("Database Error:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Gagal menyimpan ke database" }) 
    };
  }
};