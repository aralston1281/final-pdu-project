import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, data } = req.body;
  if (!name || !data) {
    return res.status(400).json({ message: "Missing name or data" });
  }

  try {
    const id = uuidv4();
    await pool.query(
      "INSERT INTO configs (id, name, data) VALUES ($1, $2, $3)",
      [id, name, data]
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    return res.status(500).json({ error: "Failed to save config" });
  }
}
