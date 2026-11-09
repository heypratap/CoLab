
import { useEffect, useState } from "react";
import { socket } from "../services/socket";

function SocketTest() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const roomId = "colab-test-room";

  useEffect(() => {
    function handleReceiveMessage(data) {
      setMessages((prev) => [...prev, data]);
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      socket.emit("join-room", roomId);
    });

    if (socket.connected) {
      socket.emit("join-room", roomId);
    }

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("connect");
      socket.off("receive-message", handleReceiveMessage);
    };
  }, []);

  function handleSendMessage() {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomId,
      message,
    });

    setMessage("");
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">
        Socket.IO Room Test
      </h2>

      <div className="border rounded p-3 h-48 overflow-y-auto space-y-2">
        {messages.map((item, index) => (
          <p key={index}>
            {item.senderId === socket.id ? "You" : "Other user"}:{" "}
            {item.message}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder="Type a message..."
          className="border rounded px-3 py-2 flex-1"
        />

        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default SocketTest;
