import { EventEmitter } from "events";
import express from "express";
import * as trpc from "@trpc/server";
import { z } from "zod";
import * as trpcExpress from "@trpc/server/adapters/express";
import { TRPCError } from "@trpc/server";
import cors from "cors";

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const getUser = () => {
    if (req.headers.authorization !== "secret") {
      return null;
    }
    return {
      name: "alex",
    };
  };

  return {
    req,
    res,
    user: getUser(),
  };
};
type Context = trpc.inferAsyncReturnType<typeof createContext>;

function createRouter() {
  return trpc.router<Context>();
}

let id = 0;

const ee = new EventEmitter();
const db = {
  posts: [
    {
      id: ++id,
      title: "hello",
    },
  ],
  messages: [createMessage("initial message")],
};
function createMessage(text: string) {
  const msg = {
    id: ++id,
    text,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  ee.emit("newMessage", msg);
  return msg;
}

const posts = createRouter()
  .mutation("create", {
    input: z.object({
      title: z.string(),
    }),
    resolve: ({ input }) => {
      const post = {
        id: ++id,
        ...input,
      };
      db.posts.push(post);
      return post;
    },
  })
  .query("list", {
    resolve: () => db.posts,
  });

const messages = createRouter()
  .query("list", {
    resolve: () => db.messages,
  })
  .mutation("add", {
    input: z.string(),
    resolve: async ({ input }) => {
      const msg = createMessage(input);

      db.messages.push(msg);

      return msg;
    },
  });

export const appRouter = createRouter()
  .query("hello", {
    input: z.string().nullish(),
    resolve: ({ input, ctx }) => {
      return `hello ${input ?? ctx.user?.name ?? "world"}`;
    },
  })
  .merge("post.", posts)
  .merge(
    "admin.",
    createRouter().query("secret", {
      resolve: ({ ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        if (ctx.user?.name !== "alex") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return {
          secret: "sauce",
        };
      },
    })
  )
  .merge("messages.", messages);

export type AppRouter = typeof appRouter;

const port = 8080;
async function main() {
  const app = express();

  app.use(cors());

  app.use((req, _res, next) => {
    console.log("⬅️ ", req.method, req.path, req.body ?? req.query);
    next();
  });

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  app.get("/", (_req, res) => res.send("hello"));
  app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`);
  });
}

main();
