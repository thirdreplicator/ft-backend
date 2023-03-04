import express from 'express'
const app = express()
const port = 3000
import { pool } from './connect.js'

const categoriesForIndex = async (pool) => {
  const categories = await pool.query('SELECT * FROM "Category"')
  const rows = await categories.rows
  const pairs = rows.map(r => [r.id, r.name])
  return Object.fromEntries(pairs)
}

const category_index = await categoriesForIndex(pool)

const getProducts = (req, resp) => {
  let modify = (obj) => {
    let { price, category_id } = obj
    price = parseFloat(price)
    let category = category_index[category_id]
    return { ...obj, price, category }
  }
  pool.query('SELECT * FROM "Product"', (error, results) => {
    if (error) { throw error }
    resp.status(200).json(results.rows.map(modify))
  })
}

app.get('/products', getProducts)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
