import { CreateContextFnOptions } from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { IncomingMessage } from 'http';
import ws from 'ws';
import * as trpc from '@trpc/server';
import { getSession } from 'next-auth/client';

export const createContext = async ({
  req,
  res,
}:
  | trpcNext.CreateNextContextOptions
  | CreateContextFnOptions<IncomingMessage, ws>) => {
  const session = await getSession({ req });
  console.log('createContext for', session?.user?.name ?? 'unknown user');
  return {
    req,
    res,
    session,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
