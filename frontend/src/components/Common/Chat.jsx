import React from "react";
import ChatBubble from "./ChatBubble";

const Chat = ({ user_profile_picture, conversation }) => {
  return (
    <div className="flex flex-col border border-gray-200 rounded-lg col-span-2 m-6 space-y-4">
      <div className="p-4" >
        {conversation.map((msg, index) => (
          <ChatBubble
            key={index}
            from={msg.from}
            senderName={msg.sender_name}
            profilePicture={user_profile_picture}
            message={msg.message}
            timestamp={msg.timestamp}
            status={msg.status || "Delivered"}
            type={msg.type || "text"}
            media={msg.media}
          />
        ))}
      </div>
    </div>
  );
};

export default Chat;
