// src/server/router/_app.ts
import { router } from "../trpc";

import { apodRouter } from "./apodRouter";

export const appRouter = router({
  apod: apodRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
