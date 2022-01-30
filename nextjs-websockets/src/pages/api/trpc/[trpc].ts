import * as trpcNext from "@trpc/server/adapters/next";
import { AppRouter, appRouter } from "server/routers/_app";
import { createContext } from "server/context";

export default trpcNext.createNextApiHandler<AppRouter>({
  router: appRouter,
  createContext,
});
