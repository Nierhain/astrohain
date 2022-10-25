import { initTRPC } from "@trpc/server";
import type { Context } from "./context";
import superjson from "superjson";
import next from "next";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

export const publicProcedure = t.procedure;