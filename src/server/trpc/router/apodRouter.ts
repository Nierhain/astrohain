import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "../../../env/server.mjs";
import { isAdmin } from "./_app";
import dayjs from "dayjs";
import { Apod, ApodType } from "@prisma/client";

export const apodRouter = router({
  populateDb: publicProcedure
    .input(z.string().length(32))
    .mutation(async ({ ctx, input }) => {
      if (!isAdmin(input)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "You are not authorized to use this route. Apply the correct key for admin actions.",
        });
      }
      let today = dayjs();
      let lastYear = dayjs().subtract(1, "year");

      let res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${env.NASA_KEY}&start_date=${lastYear}&end_date=${today}`
      );
      let data = (await res.json()) as ApodResponse[];
      data.forEach((apod) => {
        ctx.prisma.apod.create({
          data: {
            author: apod.copyright,
            createdAt: apod.date,
            description: apod.explanation,
            url: apod.url,
            type: apod.media_type === "image" ? ApodType.IMAGE : ApodType.VIDEO,
            title: apod.title,
            updatedAt: apod.date,
          },
        });
      });
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

export interface ApodResponse {
  copyright: string;
  date: Date;
  explanation: string;
  media_type: "image" | "video";
  service_version: string;
  title: string;
  url: string;
}
