import express from 'express'
const app = express()
app.use(express.json());

const port = 4000
import { create_user, signin, authenticateToken } from './models/users.js'
import { get_products, get_categories, get_options } from './models/products.js'
import { save_cart_items, get_cart_items } from './models/orders.js';
import { get_delivery_addresses } from './models/delivery_addresses.js';

app.post('/register', create_user)
app.post('/signin', signin)
app.get('/products', get_products)
app.get('/categories', get_categories)
app.get('/options', get_options)
app.get('/cart', authenticateToken, get_cart_items)
app.post('/cart', authenticateToken, save_cart_items)
app.get('/delivery_addresses', authenticateToken, get_delivery_addresses)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
