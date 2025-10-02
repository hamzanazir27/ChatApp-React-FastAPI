import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState(""); // user name
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io("http://127.0.0.1:8000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, data]); // {sid, name, message}
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && name.trim() && socketRef.current) {
      socketRef.current.emit("chat_message", {
        name,
        message: input,
      });
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">⚡ Socket.IO Chat</h1>

      {/* name input (once) */}
      {!name && (
        <div className="name-input-box">
          <input
            type="text"
            placeholder="Enter your name..."
            onKeyDown={(e) => e.key === "Enter" && setName(e.target.value)}
          />
          <button
            onClick={() => setName(document.querySelector("input").value)}
          >
            Join
          </button>
        </div>
      )}

      {name && (
        <>
          <div className="chat-box">
            {messages.map((msg, idx) => (
              <div key={idx} className="chat-message">
                <strong>{msg.name}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              className="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="chat-btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
