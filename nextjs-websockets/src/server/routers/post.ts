import { z } from 'zod';
import { createRouter } from '../createRouter';
import { Context } from '../context';
import { EventEmitter } from 'events';
import { Subscription, TRPCError } from '@trpc/server';

interface Post {
  id: string;
  text: string;
}

const posts: Post[] = [];

interface MyEvents {
  add: (data: Post) => void;
  isTypingUpdate: () => void;
}
declare interface MyEventEmitter {
  on<U extends keyof MyEvents>(event: U, listener: MyEvents[U]): this;
  once<U extends keyof MyEvents>(event: U, listener: MyEvents[U]): this;
  emit<U extends keyof MyEvents>(
    event: U,
    ...args: Parameters<MyEvents[U]>
  ): boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MyEventEmitter extends EventEmitter {}

const ee = new MyEventEmitter();

// who is currently typing, key is `name`
const currentlyTyping: Record<string, { lastTyped: Date }> =
  Object.create(null);

// every 1s, clear old "isTyping"
const interval = setInterval(() => {
  let updated = false;
  const now = Date.now();
  for (const [key, value] of Object.entries(currentlyTyping)) {
    if (now - value.lastTyped.getTime() > 3e3) {
      delete currentlyTyping[key];
      updated = true;
    }
  }
  if (updated) {
    ee.emit('isTypingUpdate');
  }
}, 3e3);
process.on('SIGTERM', () => clearInterval(interval));

const getNameOrThrow = (ctx: Context) => {
  const name = ctx.session?.user?.name;
  if (!name) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return name;
};
export const postRouter = createRouter()
  // create
  .mutation('add', {
    input: z.object({
      id: z.string().uuid().optional(),
      text: z.string().min(1),
    }),
    async resolve({ ctx, input }) {
      const name = getNameOrThrow(ctx);
      const post = {
        id: '1',
        ...input,
      };
      posts.push(post);
      ee.emit('add', post);
      delete currentlyTyping[name];
      ee.emit('isTypingUpdate');
      return post;
    },
  })
  .mutation('isTyping', {
    input: z.object({
      typing: z.boolean(),
    }),
    resolve({ input, ctx }) {
      const name = getNameOrThrow(ctx);
      if (!input.typing) {
        delete currentlyTyping[name];
      } else {
        currentlyTyping[name] = {
          lastTyped: new Date(),
        };
      }
      ee.emit('isTypingUpdate');
    },
  })
  .query('infinite', {
    input: z.object({
      cursor: z.date().nullish(),
      take: z.number().min(1).max(50).nullish(),
    }),
    async resolve() {
      return {
        items: posts,
        prevCursor: null,
      };
    },
  })
  .subscription('onAdd', {
    resolve() {
      return new Subscription<Post>((emit) => {
        const onAdd = (data: Post) => emit.data(data);
        ee.on('add', onAdd);
        return () => {
          ee.off('add', onAdd);
        };
      });
    },
  })
  .subscription('whoIsTyping', {
    resolve() {
      let prev: string[] | null = null;
      return new Subscription<string[]>((emit) => {
        const onIsTypingUpdate = () => {
          const newData = Object.keys(currentlyTyping);

          if (!prev || prev.toString() !== newData.toString()) {
            emit.data(newData);
          }
          prev = newData;
        };
        ee.on('isTypingUpdate', onIsTypingUpdate);
        return () => {
          ee.off('isTypingUpdate', onIsTypingUpdate);
        };
      });
    },
  });
