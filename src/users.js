import { pool } from './connect.js'
import bcrypt from 'bcrypt'

export const create_user = async (req, res) => {
  const { name, email, password, phone_number } = req.body;
  const client = await pool.connect();
  const saltRounds = 10

  try {
    await client.query('BEGIN');
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    const queryText = 'INSERT INTO "User" (name, email, hashed_password, phone_number) VALUES ($1, $2, $3, $4) RETURNING id';
    const result = await client.query(queryText, [name, email, hashedPassword, phone_number]);
    const userId = result.rows[0].id;
    await client.query('COMMIT');
    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ message: 'Error registering user' });
  } finally {
    client.release();
  }
};