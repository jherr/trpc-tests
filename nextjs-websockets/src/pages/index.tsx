import { useState } from "react";
import { trpc } from "../utils/trpc";

export default function IndexPage() {
  // Get the initial messages
  const messages = trpc.useQuery(["getMessages"]);
  const [subMessages, setSubMessages] = useState<typeof messages["data"]>(
    () => {
      return messages.data;
    },
  );
  // Add in new messages from the subscription
  trpc.useSubscription(["onAdd"], {
    onNext(msg) {
      setSubMessages((msgs) => [...(msgs || []), msg]);
    },
  });

  // Supports adding a message to the chat
  const addMessage = trpc.useMutation(["addMessage"]);
  const [user, setUser] = useState("Jack");
  const [message, setMessage] = useState("");
  const onAdd = async () => {
    if (message.trim().length) {
      await addMessage.mutate({
        message,
        user,
      });
      setMessage("");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div>
        {subMessages?.map(({ user: msgUser, message }, i) => (
          <div
            className={`grid ${msgUser === user ? "justify-items-end" : ""}`}
            key={[msgUser, i].join(":")}
          >
            <div
              className={`py-3 px-5  text-white text-2xl my-2 rounded-3xl w-3/5 ${
                msgUser === user
                  ? "inline-flex items-right bg-pink-800"
                  : "bg-cyan-800"
              }`}
            >
              <div>{message}</div>
              {msgUser !== user && (
                <div className="text-right text-sm font-light">{msgUser}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex mt-10">
        <input
          type="text"
          value={user}
          onKeyPress={(e) => {
            if (e.key === "Enter") onAdd();
          }}
          onChange={(e) => setUser(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-md border-gray-300 rounded-md w-1/4 mr-2"
          placeholder="Your name"
        />
        <input
          type="text"
          value={message}
          onKeyPress={(e) => {
            if (e.key === "Enter") onAdd();
          }}
          onChange={(e) => setMessage(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-md border-gray-300 rounded-md w-1/2 mr-2"
          placeholder="Message"
        />
        <button
          onClick={onAdd}
          className="inline-flex items-center px-3.5 py-2 border border-transparent text-md leading-4 font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-1/4"
        >
          Send
        </button>
      </div>
    </div>
  );
}
