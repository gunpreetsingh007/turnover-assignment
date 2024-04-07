import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Define the number of categories per page
const CATEGORIES_PER_PAGE = 6;

export const categoryRouter = createTRPCRouter({

    editUserInterests: protectedProcedure
        .input(z.object({
            categoryId: z.string().uuid(),
            isInterested: z.boolean(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { categoryId, isInterested } = input;
            const userId = ctx.currentUser!.id;

            if (isInterested) {
                await ctx.db.userInterest.upsert({
                    where: {
                        userId_categoryId: {
                            userId,
                            categoryId
                        }
                    },
                    create: {
                        userId,
                        categoryId
                    },
                    update: {
                        userId,
                        categoryId
                    }
                })
            }
            else {
                await ctx.db.userInterest.deleteMany({
                    where: {
                        userId,
                        categoryId
                    }
                })
            }
            return { message: 'success' };
        }),

    getPaginatedCategories: protectedProcedure
        .input(z.object({
            page: z.number().min(1), // Accept a page number, ensure it's at least 1
        }))
        .query(async ({ ctx, input }) => {
            const { page } = input;
            const userId = ctx.currentUser?.id;

            // Calculate the pagination offset
            const offset = (page - 1) * CATEGORIES_PER_PAGE;

            const paginatedCategoriesWithInterest = await ctx.db.category.findMany({
                skip: offset,
                take: CATEGORIES_PER_PAGE,
                select: {
                    id: true,
                    name: true,
                    users: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            userId: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });

            // Map the categories to include a boolean for user interest
            const categoriesWithInterest = paginatedCategoriesWithInterest.map(category => {
                const { users, ...categoryWithoutUsers } = category;
                return {
                    ...categoryWithoutUsers,
                    isInterested: users.length > 0, // If the user has an interest, the array won't be empty
                };
            });

            return categoriesWithInterest;
        }),
    getTotalPaginatedCountForCategories: protectedProcedure
        .query(async ({ ctx }) => {
            const totalCategoryCount = await ctx.db.category.count();
            return Math.ceil(totalCategoryCount / CATEGORIES_PER_PAGE);
        }),
});
