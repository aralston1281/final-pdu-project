// === Step 2: API route to list all saved config names ===
// File: /pages/api/list-configs.js

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const result = await pool.query(
      "SELECT DISTINCT name FROM configs ORDER BY name ASC"
    );
    const names = result.rows.map(row => row.name);
    return res.status(200).json(names);
  } catch (error) {
    console.error("List error:", error);
    return res.status(500).json({ error: "Failed to list configs" });
  }
}
