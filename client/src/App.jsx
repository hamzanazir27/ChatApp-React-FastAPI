import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const socket = io("http://127.0.0.1:8000", {
      transports: ["websocket"], // important for vite
    });

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, `${data.sid}: ${data.message}`]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const socket = io("http://127.0.0.1:8000");
    socket.emit("chat_message", input);
    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>⚡ Socket.IO Chat (Vite + React + FastAPI)</h1>
      <div>
        {messages.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
