import express from 'express'
const app = express()
const port = 4000
import { get_products } from './load_products.js'

app.get('/products', get_products)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
