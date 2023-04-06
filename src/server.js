import express from 'express'
const app = express()
app.use(express.json());

const port = 4000
import { create_user, signin } from './users.js'
import { get_products, get_categories, get_options } from './load_products.js'

app.post('/register', create_user)
app.post('/signin', signin)
app.get('/products', get_products)
app.get('/categories', get_categories)
app.get('/options', get_options)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
