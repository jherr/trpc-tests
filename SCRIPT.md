```sh
mkdir express-react
mkdir express-react/packages
```

https://gist.github.com/jherr/ef96f1e9b6c41de79120f606578b7438

npx create-mf-app - client, app, 8080, react, typescript, tailwind
npx create-mf-app - api, api sever, 8081

On both:

```
npx tsc --init 
```

For client do `"jsx": "preserve"`

At top level:

```sh
yarn
```

In API:

```sh
yarn add @trpc/server zod cors
yarn add @types/cors -D
```

```ts
import express from "express";
import * as trpc from "@trpc/server";

const appRouter = trpc.router().query("hello", {
  resolve() {
    return "Hello there";
  },
});

export type AppRouter = typeof appRouter;
```

```ts
import * as trpcExpress from "@trpc/server/adapters/express";

...

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => null,
  })
);
```

```ts
import cors from "cors";

...

app.use(cors());
```

```sh
curl http://localhost:8081/trpc/hello
```

```sh
yarn add ts-node-dev -D
```

```json
  "scripts": {
    "start": "ts-node-dev index.ts"
  },
  "main": "index.ts",
```

In client:

```sh
yarn add @trpc/client @trpc/server @trpc/react react-query zod
```

```sh
yarn add api@1.0.0
```

```ts
import { createReactQueryHooks } from "@trpc/react";
import type { AppRouter } from "api";

export const trpc = createReactQueryHooks<AppRouter>();
```

```tsx
import React from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "./trpc";

import "./index.scss";

const AppContent = () => (
  <div className="mt-10 text-3xl mx-auto max-w-6xl">
    <div>Name: client</div>
    <div>Framework: react</div>
    <div>Language: TypeScript</div>
    <div>CSS: Tailwind</div>
  </div>
);

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: "http://localhost:8081/trpc",
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
```

```tsx
const AppContent = () => {
  const hello = trpc.useQuery(["hello"]);

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <div>{JSON.stringify(hello.data)}</div>
    </div>
  );
};
```

```ts
import { z } from "zod";

interface ChatMessage {
  user: string;
  message: string;
}

const messages: ChatMessage[] = [
  { user: "user1", message: "Hello" },
  { user: "user2", message: "Hi" },
];

const appRouter = trpc
  .router()
  .query("hello", {
    resolve() {
      return "Hello there again Jack";
    },
  })
  .query("getMessages", {
    input: z.number().default(10),
    resolve({ input }) {
      return messages.slice(-input);
    },
  });
```

```ts
const AppContent = () => {
  const getMessages = trpc.useQuery(["getMessages", 1]);

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <div>{JSON.stringify(getMessages.data)}</div>
    </div>
  );
};
```

```tsx
      <div>
        {(getMessages.data || []).map((row, i) => (
          <div key={i}>{JSON.stringify(row)}</div>
        ))}
      </div>
```

```ts
  .mutation("addMessage", {
    input: z.object({
      user: z.string(),
      message: z.string(),
    }),
    resolve({ input }) {
      messages.push(input);
      return input;
    },
  });
```

```ts
  const addMessage = trpc.useMutation("addMessage");
  const onAdd = () => {
    addMessage.mutate({
      message: "Hello world",
      user: "Jack",
    });
  };
```

```tsx
      <div className="mt-10">
        <button onClick={onAdd}>Add message</button>
      </div>
```

```ts
const queryClient = new QueryClient();
```

```ts
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["getMessages"]);
        },
      }
```

```ts
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const addMessage = trpc.useMutation("addMessage");
  const onAdd = () => {
    addMessage.mutate(
      {
        message,
        user,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["getMessages"]);
        },
      }
    );
  };
```

```tsx
      <div className="mt-10">
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="p-5 border-2 border-gray-300 rounded-lg w-full"
          placeholder="User"
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-5 border-2 border-gray-300 rounded-lg w-full"
          placeholder="Message"
        />
      </div>
```

