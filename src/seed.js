//console.log(process.env.DATABASE_URL)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  //await prisma.product.deleteMany()
  //const product = await prisma.product.create({ data: { name: "Burger" } })
  //console.log(product)  
  
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })