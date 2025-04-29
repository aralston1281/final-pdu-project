import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: 'Missing name' });
  }

  try {
    await sql`DELETE FROM configurations WHERE name = ${name}`;
    res.status(200).json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Failed to delete configuration:', error);
    res.status(400).json({ message: 'Failed to delete configuration', error: error.message });
  }
}
