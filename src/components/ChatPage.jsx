import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { User, Send } from 'react-feather'
import './ChatPage.css'

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const { chatId } = useParams();
    const location = useLocation();
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const { friendName } = location.state || {};
  
    // Authentication check
    if (!localStorage.getItem("isAuthenticated")) {
      window.location.href = "/login";
    }
  
    // Fetch messages for current chat
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getMessages?chatId=${chatId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    useEffect(() => {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }, [chatId]);
  
    const handleSendMessage = async () => {
      if (!newMessage.trim()) return;
  
      const newMsg = {
        text: newMessage,
        uid: loggedInUser.uid,
        chatId: chatId,
        sender: loggedInUser.username,
      };
  
      try {
        const response = await fetch("http://localhost:5000/addMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMsg),
        });
  
        if (response.ok) {
          setNewMessage("");
          await fetchMessages();
        }
      } catch (error) {
        console.error("Error adding message:", error);
      }
    };
  
    return (
      <div className="chat-container">
        <div className="header">
          <User className="mr-2" /> Chat with {friendName || "Friend"}
        </div>
  
        <div className="messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.uid === loggedInUser.uid ? "me" : "other"}`}
            >
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
  
        <div className="input-box">
          <input
            type="text"
            className="input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage} className="send-button">
            <Send size={20} />
          </button>
        </div>
      </div>
    )
}

export default ChatPage
