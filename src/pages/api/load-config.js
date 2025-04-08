// === Step 1: API route to load config ===
// File: /pages/api/load-config.js

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: "Missing config name" });
  }

  try {
    const result = await pool.query(
      "SELECT data FROM configs WHERE name = $1 ORDER BY created_at DESC LIMIT 1",
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Config not found" });
    }

    return res.status(200).json(result.rows[0].data);
  } catch (error) {
    console.error("Load error:", error);
    return res.status(500).json({ error: "Failed to load config" });
  }
}
