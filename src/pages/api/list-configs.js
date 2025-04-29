// pages/api/list-configs.js

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const result = await sql`SELECT name FROM configurations ORDER BY created_at DESC`;
    const names = result.rows.map(row => row.name);
    res.status(200).json(names);
  } catch (error) {
    console.error('Failed to list configurations:', error);
    res.status(400).json({ message: 'Failed to list configurations', error: error.message });
  }
}
