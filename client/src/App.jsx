import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("/", { transports: ["websocket"] }); // ✅ same origin
    socketRef.current = socket;

    socket.on("connect", () => console.log("✅ Connected", socket.id));

    socket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, `${data.sid}: ${data.message}`]);
    });

    return () => socket.disconnect();
  }, []);

  function sendMessage() {
    if (socketRef.current && input.trim()) {
      socketRef.current.emit("chat_message", input);
      setInput("");
    }
  }

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
