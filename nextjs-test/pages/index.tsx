import { trpc } from "../utils/trpc";

const IndexPage = () => {
  const messages = trpc.useQuery(["getMessages"]);
  const addMessage = trpc.useMutation(["addMessage"]);
  const context = trpc.useContext();

  if (!messages.data) {
    return <div>Loading...</div>;
  }

  const onAdd = async () => {
    await addMessage.mutate({
      message: "Hello from client",
      user: "Jack",
    });
    context.invalidateQueries(["getMessages"]);
  };

  return (
    <div>
      <div>{JSON.stringify(messages.data)}</div>
      <div>
        <button onClick={onAdd}>Add</button>
      </div>
    </div>
  );
};

export default IndexPage;
