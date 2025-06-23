import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient() {
  try {
    const client = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
    // Test connection
    client.$connect().catch((e: Error) => {
      console.error("Prisma Client connection error:", e);
      throw e;
    });

    return client;
  } catch (error) {
    console.error("Error initializing Prisma client:", error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
