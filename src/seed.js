//console.log(process.env.DATABASE_URL)
import fs from 'fs'
import yaml from 'js-yaml'
import pg from 'pg'
const pool = new pg.Pool({
  "host": "127.0.0.1",
  "port": 5433,
  "user": "postgres",
  "password": "",
  "database": "firsttime_dev",
  "max": 1,
  "idleTimeoutMillis": 0,
  "connectionTimeoutMillis": 0,
})

async function main() {
  /*
    Read Products *.yml file.
  */
  const client = await pool.connect()

  var yaml_doc
  try {
    console.log("Read in products.yml.")
    yaml_doc = yaml.load(fs.readFileSync('./data/products/products.yml', 'utf8'));
    console.log("✓ Read in Product YML file.")
  } catch (e) {
    console.log(e);
  }


  /*
    Loop through categories and products.
  */
    //await prisma.category.deleteMany()
  await client.query('DELETE from "Category"')
  await yaml_doc.categories.map(category => {
    client.query(`INSERT INTO "Category" (name, position) VALUES('${category.name}', ${category.position})`, (err) => err && console.log(err));
  })

  /*
   * Make a look-up table of categories by name.
   */
  var { rows } = await client.query('SELECT id, name FROM "Category";')
  let categories = Object.fromEntries(rows.map(c => [c.name, c.id]))


  await client.query('DELETE from "Product"')

  var count = 0
  yaml_doc.products.forEach(async (prod, i) => {
    count += 1
    // if (i > 1) { return undefined }
    console.log("Working on `"  + prod.name  + "`, '" + prod.category + "'")
    let query = 'INSERT INTO "Product" (name, price, image, "categoryId", is_original) VALUES($1, $2, $3, $4, $5)'
    let category_id = categories[prod.category]
    if (category_id == undefined) {
      throw new Error(`Could not find a category id for product ${JSON.stringify(prod.name)} category ${JSON.stringify(prod.category)} in ${JSON.stringify(Object.keys(categories))}`) }
    let params = [prod.name, prod.price, prod.image, category_id, prod.is_original]
    // console.log(JSON.stringify(params))
    await client.query(query,  params, (err) => err && console.error(err))
  })
  client.release()
}

await main()
