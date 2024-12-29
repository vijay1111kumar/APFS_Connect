import React from "react";
import ChatBubble from "./ChatBubble";

const Chat = ({ conversation }) => {
  return (
    <div className="flex flex-col space-y-4">
      {conversation.map((msg, index) => (
        <ChatBubble
          key={index}
          from={msg.from}
          senderName={msg.senderName}
          profilePicture={msg.profilePicture}
          message={msg.message}
          timestamp={msg.timestamp}
          status={msg.status || "Delivered"}
          type={msg.type || "text"}
          media={msg.media}
        />
      ))}
    </div>
  );
};

export default Chat;
