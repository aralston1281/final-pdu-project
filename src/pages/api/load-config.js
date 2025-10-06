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

    // Set headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json(result.rows[0].config); // 🔥 send ONLY the config part
  } catch (error) {
    console.error('Failed to load configuration:', error);
    res.status(400).json({ message: 'Failed to load configuration', error: error.message });
  }
}
