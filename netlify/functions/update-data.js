const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  if (!user || !(user.app_metadata.roles || []).includes('admin')) {
    return { statusCode: 403, body: JSON.stringify({ error: "Unauthorized Admin Only" }) };
  }

  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { id, desc, amount, type, date } = JSON.parse(event.body);
    const client = await connectToDatabase();
    const db = client.db("finance_company_db");

    const result = await db.collection("transactions").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          desc, 
          amount: parseFloat(amount), 
          type, 
          date: new Date(date),
          updatedAt: new Date(),
          updatedBy: user.email
        } 
      }
    );

    return { 
      statusCode: 200, 
      body: JSON.stringify({ msg: "Updated Success", result }) 
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};