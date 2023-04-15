import { pgPool } from '../connect.js';

export const get_delivery_addresses = async (req, res) => {
  try {
    const user_id = req.user.userId;
    console.log('get_delivery_addresses: user_id', user_id)
    const { rows } = await pgPool.query('SELECT * FROM delivery_addresses WHERE user_id=$1', [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};