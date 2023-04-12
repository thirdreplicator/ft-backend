import { pgPool, redisClient } from '../connect.js'


const order_status = {
  IN_CART: 'in-cart',
  SUBMITTED: 'submitted',
  PREPARING: 'preparing',
  READY_FOR_DELIVERY: 'ready-for-delivery',
  ON_ROUTE: 'on-route',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
  CANNOT_FULFILL: 'cannot-fulfill'
}


export const get_orders = (req, resp) => {
  const user_id = 1
  pgPool.query('SELECT * FROM "Order" WHERE "user_id"=$1', [user_id], (error, results) => {
    if (error) { throw error }
    resp.status(200).json(results.rows.map(modify))
  })
}

export const get_cart_items = async (req, res) => {
  const { userId } = req.user;

  try {
    const redisKey = `user:${userId}:cart`;
    const cartItems = await redisClient.get(redisKey);

    if (cartItems) {
      const lineItems = JSON.parse(cartItems);
      res.status(200).json(lineItems);
    } else {
      res.status(200).json([]);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const save_cart_items = async (req, res) => {
  const { userId } = req.user;
  const lineItems = req.body;

  try {
    await updateCartInRedis(userId, lineItems);
    res.status(200).json({ message: 'Shopping cart saved successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

const updateCartInRedis = async (userId, lineItems) => {
  const redisKey = `user:${userId}:cart`;
  const lineItemsJSON = JSON.stringify(lineItems);

  await redisClient.set(redisKey, lineItemsJSON);
};