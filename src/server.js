import express from 'express'
const app = express()
app.use(express.json());

const port = 4000
import { create_user, signin, authenticateToken } from './models/users.js'
import { get_products, get_categories, get_options } from './models/products.js'
import { save_cart_items, get_cart_items } from './models/orders.js';
import {
  get_delivery_addresses,
  create_delivery_address,
  handleDeliveryAddressPatch,
  deleteDeliveryAddress } from './models/delivery_addresses.js';

app.post('/api/register', create_user)
app.post('/api/signin', signin)

app.get('/api/cart', authenticateToken, get_cart_items)
app.post('/api/cart', authenticateToken, save_cart_items)

app.get('/api/delivery_addresses', authenticateToken, get_delivery_addresses)
app.post('/api/delivery_addresses', authenticateToken, create_delivery_address)
app.patch('/api/delivery_addresses', authenticateToken, handleDeliveryAddressPatch)
app.delete('/api/delivery_addresses/:id', authenticateToken, deleteDeliveryAddress)

app.get('/api/products', get_products)
app.get('/categories', get_categories)
app.get('/options', get_options)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
