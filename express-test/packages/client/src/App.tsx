import React from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "./utils/trpc";

import "./index.scss";

const AppContents = () => {
  const hello = trpc.useQuery(["post.list"]);
  if (!hello.data) return <div>Loading...</div>;
  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <div>POSTS</div>
      <div>
        <p>{JSON.stringify(hello.data)}</p>
      </div>
    </div>
  );
};

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: "http://localhost:8080/trpc",
      headers() {
        return {
          authorization: "Jack",
        };
      },
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContents />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
