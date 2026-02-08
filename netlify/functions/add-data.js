const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  if (!user) return { statusCode: 401, body: "Unauthorized" };

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    const data = JSON.parse(event.body);
    await client.connect();
    const db = client.db("finance_db");
    await db.collection("transactions").insertOne({
      ...data,
      amount: parseFloat(data.amount),
      date: new Date(data.date)
    });
    return { statusCode: 200, body: JSON.stringify({ msg: "Success" }) };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  } finally {
    await client.close();
  }
};