import { pgPool, redisClient } from '../connect.js'

const ORDER_STATUS = {
  IN_CART: 'in-cart',
  SUBMITTED: 'submitted',
  PREPARING: 'preparing',
  READY_FOR_DELIVERY: 'ready-for-delivery',
  ON_ROUTE: 'on-route',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
  CANNOT_FULFILL: 'cannot-fulfill'
}

export const myOrders = (req, resp) => {
  const { userId } = req.user;
  try {
    pgPool.query('SELECT * FROM "orders" WHERE "user_id"=$1', [user_id], (error, results) => {
      if (error) { throw error }
      resp.status(200).json(results.rows.map(modify))
    })
  } catch(e) {
    resp.status(500).json({message: e.message})
  }
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
      res.status(200).json({data: [], updatedAt: 0});
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

async function createOrder(req, res) {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    const { userId } = req.user;
    const { deliveryAddressId, lineItems } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: user_id' });
    } else if (!deliveryAddressId) {
      return res.status(400).json({ error: 'Missing required field: delivery_address_id' });
    } else if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: 'Missing required field: lineItems' });
    }

    const orderQuery = `
      INSERT INTO public.orders (user_id, status, delivery_address_id)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, status, created_at, delivery_address_id;
    `;
    const orderValues = [userId, ORDER_STATUS.SUBMITTED, deliveryAddressId];
    const orderResult = await client.query(orderQuery, orderValues);
    const orderId = orderResult.rows[0].id;

    const lineItemsQuery = `
      INSERT INTO public.line_items (order_id, user_id, product_id, option_ids, status, quantity, price)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, order_id, user_id, product_id, option_ids, status, quantity, price, created_at;
    `;

    const lineItemsPromises = lineItems.map(async (item) => {
      const { product_id, option_ids, quantity, price } = item;
      const lineItemValues = [orderId, userId, product_id, option_ids, ORDER_STATUS.SUBMITTED, quantity, price];
      const lineItemResult = await client.query(lineItemsQuery, lineItemValues);
      return lineItemResult.rows[0];
    });

    const insertedLineItems = await Promise.all(lineItemsPromises);

    await client.query('COMMIT');
    res.status(201).json({ order: orderResult.rows[0], lineItems: insertedLineItems });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  } finally {
    // Release the client back to the connection pool.
    client.release();
  }
}