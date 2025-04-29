import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: 'Missing name' });
  }

  try {
    const result = await sql`SELECT config FROM configurations WHERE name = ${name} LIMIT 1`;

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Config not found' });
    }

    res.status(200).json(result.rows[0].config); // 🔥 send ONLY the config part
  } catch (error) {
    console.error('Failed to load configuration:', error);
    res.status(400).json({ message: 'Failed to load configuration', error: error.message });
  }
}
