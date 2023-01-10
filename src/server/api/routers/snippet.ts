import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const snippetRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.snippet.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getTopThree: publicProcedure.query(({ ctx }) => {
    // Use prisma to find the most recent three snippets
    return ctx.prisma.snippet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });
  }),
  create: publicProcedure
    .input(
      z.object({
        code: z.string().max(999999),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const snippet = await ctx.prisma.snippet.create({
        data: {
          code: input.code,
        },
      });
      return snippet;
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const snippet = await ctx.prisma.snippet.delete({
        where: {
          id: input.id,
        },
      });
      return snippet;
    }),
});
