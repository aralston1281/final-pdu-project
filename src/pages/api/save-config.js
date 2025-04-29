import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, config } = req.body;

  if (!name || !config) {
    return res.status(400).json({ message: 'Missing name or config' });
  }

  try {
    await sql`
      INSERT INTO configurations (id, name, config, created_at)
      VALUES (gen_random_uuid(), ${name}, ${config}, NOW())
    `;
    res.status(200).json({ message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Failed to save configuration:', error);
    res.status(500).json({ message: 'Failed to save configuration', error: error.message });
  }
}
