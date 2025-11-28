import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding admin user...")

  const existing = await prisma.admin.findUnique({
    where: { email: "admin@example.com" }
  })

  if (!existing) {
    await prisma.admin.create({
      data: {
        name: "Super Admin",
        email: "admin@example.com",
        password: bcrypt.hashSync("admin123", 10)
      }
    })
    console.log("✔ Admin created")
  } else {
    console.log("ℹ Admin already exists")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
