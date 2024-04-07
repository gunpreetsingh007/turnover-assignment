import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {   
    const categories = Array.from({ length: 100 }, () => ({
        name: faker.commerce.department()
    }));

    for (const category of categories) {
        await prisma.category.create({
            data: category,
        });
    }

    console.log(`Inserted ${categories.length} categories.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });