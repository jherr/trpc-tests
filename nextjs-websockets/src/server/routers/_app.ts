import { Subscription } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { EventEmitter } from "events";

import { createRouter } from "../createRouter";

const ee = new EventEmitter();

interface Message {
  user: string;
  message: string;
}

const messages: Message[] = [
  {
    user: "Jane",
    message: "What's up?",
  },
  {
    user: "Jack",
    message: "Not much, just chillin'",
  },
];

export const appRouter = createRouter()
  .transformer(superjson)
  .query("getMessages", {
    resolve() {
      return messages;
    },
  })
  .mutation("addMessage", {
    input: z.object({
      user: z.string(),
      message: z.string(),
    }),
    resolve({ input }) {
      const msg = {
        ...input,
      };
      messages.push(msg);
      ee.emit("add", msg);
      return messages;
    },
  })
  .subscription("onAdd", {
    resolve({ ctx }) {
      return new Subscription<Message>((emit) => {
        const onAdd = (data: Message) => {
          emit.data(data);
        };
        ee.on("add", onAdd);
        return () => {
          ee.off("add", onAdd);
        };
      });
    },
  });

export type AppRouter = typeof appRouter;
