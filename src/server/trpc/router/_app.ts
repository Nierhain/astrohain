// src/server/router/_app.ts
import { env } from "../../../env/server.mjs";
import { router } from "../trpc";
import { apodRouter } from "./apodRouter";
import { astrobinRouter } from "./astrobinRouter";

export const appRouter = router({
  apod: apodRouter,
  astrobin: astrobinRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const isAdmin = (key: string) => {
  return key === env.ADMIN_KEY;
};