import { useState } from "react";
import { Send } from "lucide-react";
import { getCurrentUser } from "aws-amplify/auth";
import BedrockAgentService from "../../services/BedrockAgentService";

const currentUser = await getCurrentUser();
// Define message type
type Message = {
  id: number;
  text: string;
  sender: "user" | "empresa";
  timestamp: Date;
};

// Initialize service
const bedrockService = new BedrockAgentService(
  import.meta.env.VITE_AWS_REGION,
  import.meta.env.VITE_AGENT_ID,
  import.meta.env.VITE_AGENT_ALIAS_ID
);

const CompaniesPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: "empresa",
      timestamp: new Date(),
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const botResponse = await bedrockService.sendMessage(
        newMessage,
        currentUser.userId
      );

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse.toString(),
        sender: "empresa",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
    }

    setNewMessage("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full max-h-[calc(100vh-120px)]">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold">Empresas Chat</h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs mt-1 text-gray-500">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
