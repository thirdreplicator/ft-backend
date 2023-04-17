import { pgPool } from '../connect.js';

export const get_delivery_addresses = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const selectAddresses = 'SELECT * FROM delivery_addresses WHERE user_id=$1 AND deleted_at = 0 '
      + 'ORDER BY id DESC'
    const { rows } = await pgPool.query(selectAddresses, [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const create_delivery_address = async (req, res) => {
  const client = await pgPool.connect();
  try {
    const user_id = req.user.userId;
    const address = req.body;

    // Start a transaction.
    await client.query('BEGIN');

    // Set all existing addresses' use_as_primary to false.
    const resetAllPrimaryAddresses = 'UPDATE delivery_addresses SET use_as_primary=false WHERE user_id=$1;';
    await client.query(resetAllPrimaryAddresses, [user_id]);

    // Insert the new delivery address and set it as primary.
    const insertStatement = 'INSERT INTO delivery_addresses '
      + '(user_id, recipient, phone, street, city, province, barangay, zip, special_instructions, use_as_primary) '
      + 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
    await client.query(insertStatement, [
      user_id,
      address.recipient,
      address.phone,
      address.street,
      address.city,
      address.province,
      address.barangay,
      address.zip,
      address.special_instructions,
      true, // Set the new address as primary.
    ]);

    // Commit the transaction.
    await client.query('COMMIT');
    const { rows } = await pgPool.query('SELECT * FROM delivery_addresses WHERE user_id=$1 and deleted_at = 0 ORDER BY id DESC', [user_id]);
    res.status(201).json(rows);
  } catch (error) {
    // If there's an error, rollback the transaction.
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    // Release the client back to the connection pool.
    client.release();
  }
};

export const handleDeliveryAddressPatch = async (req, res) => {
  const client = await pgPool.connect();
  try {
    const user_id = req.user.userId;
    const { id, action } = req.body;

    if (!action) {
      return res.status(400).json({ message: "Missing 'action' field in request body" });
    }

    // Start a transaction.
    await client.query('BEGIN');
    
    if (action === 'set_primary') {
      // First, set all user's delivery addresses' use_as_primary to false.
      const resetAllPrimaryAddresses = 'UPDATE delivery_addresses SET use_as_primary=false WHERE user_id=$1;';
      client.query(resetAllPrimaryAddresses, [user_id]);

      // Now set the new primary delivery address.
      const patchStatement = 'UPDATE delivery_addresses SET use_as_primary=true WHERE user_id=$1 and id=$2 and deleted_at = 0';
      const { rows } = await client.query(patchStatement, [user_id, id]);
      res.status(200).json(rows);
    } else if (action === 'soft_delete') {
      const deleteStatement = 'UPDATE delivery_addresses SET deleted_at=$1 WHERE user_id=$2 and id=$3';
      const now = Date.now();
      const { rows } = await client.query(deleteStatement, [now, user_id, id]);
      res.status(200).json(rows);
    } else {
      res.status(400).json({ message: `Invalid 'action' field: ${action}` });
    }

    // Commit the transaction.
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    // Release the client back to the connection pool.
    client.release();
  }
};

export const deleteDeliveryAddress = async (req, res) => {
  const client = await pgPool.connect();
  
  try {
    const user_id = req.user.userId;
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Missing 'id' parameter in the request URL" });
    }

    // Start a transaction.
    await client.query('BEGIN');
    
    // Check if the delivery address is set as primary
    const checkPrimaryStatement = 'SELECT use_as_primary FROM delivery_addresses WHERE user_id=$1 and id=$2;';
    const { rows } = await client.query(checkPrimaryStatement, [user_id, id]);
    const isPrimary = rows.length > 0 && rows[0].use_as_primary;
    
    // Perform soft delete on the delivery address.
    const deleteStatement = 'UPDATE delivery_addresses SET deleted_at=$1, use_as_primary=false WHERE user_id=$2 and id=$3';
    const now = Date.now();
    
    const { rowCount } = await client.query(deleteStatement, [now, user_id, id]);
    
    if (rowCount === 0) {
      res.status(404).json({ message: 'Delivery address not found or already deleted' });
    } else {
      // If the deleted address was primary, set the most recent address as the new primary address.
      if (isPrimary) {
        const setNewPrimaryStatement = `UPDATE delivery_addresses
          SET use_as_primary = true
          FROM (
            SELECT id
            FROM delivery_addresses
            WHERE user_id = $1 AND deleted_at = 0
            ORDER BY id DESC
            LIMIT 1
          ) AS subquery
          WHERE delivery_addresses.id = subquery.id`
        await client.query(setNewPrimaryStatement, [user_id]);
      }

      res.status(200).json({ message: 'Delivery address deleted successfully' });
    }
    // Commit the transaction.
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    // Release the client back to the connection pool.
    client.release();
  }
};