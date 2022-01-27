import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import { EventEmitter } from "events";

const ee = new EventEmitter();

interface ChatMessage {
  user: string;
  message: string;
}

const messages: ChatMessage[] = [
  { user: "user1", message: "Hello" },
  { user: "user2", message: "World" },
];

const appRouter = trpc
  .router()
  .query("getMessages", {
    input: z.object({}).nullish(),
    resolve() {
      return messages;
    },
  })
  .mutation("addMessage", {
    input: z
      .object({
        user: z.string(),
        message: z.string(),
      })
      .nullish(),
    resolve({ input }) {
      if (input) {
        messages.push(input);
        ee.emit("add", input);
      }
      return messages;
    },
  })
  .subscription("messages", {
    resolve() {
      return new trpc.Subscription<ChatMessage>((emit) => {
        const onAdd = (data: ChatMessage) => {
          emit.data(data);
        };
        ee.on("add", onAdd);
        return () => {
          ee.off("add", onAdd);
        };
      });
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
