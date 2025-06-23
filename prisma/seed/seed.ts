import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminExists = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        username: "admin",
        password: await bcrypt.hash("admin1234", 10),
        role: "admin",
      },
    });
    console.log("Admin user created");
  }

  // Create Pna user
  const pnaExists = await prisma.user.findUnique({
    where: { username: "Pna" },
  });

  if (!pnaExists) {
    await prisma.user.create({
      data: {
        username: "Pna",
        password: await bcrypt.hash("Pna1234", 10),
        role: "viewer",
      },
    });
    console.log("Pna user created");
  }

  console.log("Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
