import React from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "./trpc";

import "./index.scss";

const queryClient = new QueryClient();

const AppContent = () => {
  const getMessages = trpc.useQuery(["getMessages"], {
    refetchInterval: 1000,
  });

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

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <div>
        {(getMessages.data || []).map((row, i) => (
          <div key={i}>{JSON.stringify(row)}</div>
        ))}
      </div>
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
      <div>
        <button onClick={onAdd}>Add message</button>
      </div>
    </div>
  );
};

function App() {
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
