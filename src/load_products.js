import { pool } from './connect.js'

export const categoriesForIndex = async (pool) => {
  const categories = await pool.query('SELECT * FROM "Category"')
  const rows = await categories.rows
  const pairs = rows.map(r => [r.id, r.name])
  return Object.fromEntries(pairs)
}

export const category_index = await categoriesForIndex(pool)

export const get_products = (req, resp) => {
  let modify = (obj) => {
    let { price, category_id } = obj
    price = parseFloat(price)
    let category = category_index[category_id]
    return { ...obj, price }
  }
  pool.query('SELECT * FROM "Product"', (error, results) => {
    if (error) { throw error }
    resp.status(200).json(results.rows.map(modify))
  })
}

export const get_categories = (req, resp) => {
  pool.query('SELECT * FROM "Category"', (error, results) => {
    if (error) { throw error }
    resp.status(200).json(results.rows)
  })
}

export const get_options = (req, resp) => {
  pool.query('SELECT * FROM "Option"', (error, results) => {
    if (error) { throw error }
    let modify = (obj) =>  {
      const { price_modifier } = obj
      let new_row = {  ...obj, price_modifier: parseInt(price_modifier) }
      delete new_row.created_at
      delete new_row.is_deleted
      return new_row
    }
    resp.status(200).json(results.rows.map(modify))
  })
}