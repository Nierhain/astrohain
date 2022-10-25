import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "../../../env/server.mjs";
import { isAdmin } from "./_app";

export const apodRouter = router({
  populateDb: publicProcedure
    .input(z.string().length(32))
    .mutation(({ ctx, input }) => {
      if (!isAdmin(input)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "You are not authorized to use this route. Apply the correct key for admin actions.",
        });
      }
      fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${env.NASA_KEY}&start_date=`
      );
    }),

  getToday: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.apod
      .findFirst({ where: { createdAt: { equals: new Date() } } })
      .then((res) => res);
  }),
  getSpecific: publicProcedure.input(z.date()).query(({ ctx, input }) => {
    return ctx.prisma.apod.findFirst({
      where: {
        createdAt: {
          equals: input.toDateString(),
        },
      },
    });
  }),
});
