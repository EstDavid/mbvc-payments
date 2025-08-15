import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const phoneNumber = '+34655000999';

async function main () {

  const firstOrder = await prisma.order.create({
    data: {
      amount: 36,
      description: 'Yearly subscription',
      status: 'Paid',
      email: 'player@montgobvc.com',
      user: {
        connectOrCreate: {
          where: { phoneNumber },
          create: {
            phoneNumber,
            name: 'Player',
            lastName: 'Montgo',
          }
        },
      },
    },
  });

  console.log({ firstOrder });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });