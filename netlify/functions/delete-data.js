const { MongoClient, ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401, body: "Unauthorized" };

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    const { id } = JSON.parse(event.body);
    await client.connect();
    const db = client.db("finance_db");
    await db.collection("transactions").deleteOne({ _id: new ObjectId(id) });
    return { statusCode: 200, body: JSON.stringify({ msg: "Deleted" }) };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  } finally {
    await client.close();
  }
};