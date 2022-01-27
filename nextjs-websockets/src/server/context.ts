import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import * as trpcNext from "@trpc/server/adapters/next";
import { IncomingMessage } from "http";
import ws from "ws";
import * as trpc from "@trpc/server";

export const createContext = async ({
  req,
  res,
}:
  | trpcNext.CreateNextContextOptions
  | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
  return {
    req,
    res,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
