import React from "react";

const ChatBubble = ({ from, senderName, profilePicture, message, timestamp, status, type, media }) => {
  const isUser = from === "user"; // Check if the message is from the user

  return (
    <div className={`flex items-start gap-2.5 ${isUser ? "justify-start" : "justify-end"}`}>
      {/* Profile Picture */}
      {isUser && (
        <img
          className="w-8 h-8 rounded-full"
          src={profilePicture || "/default-avatar.png"}
          alt={`${senderName || "User"}'s image`}
        />
      )}

      {/* Message Bubble */}
      <div className="flex flex-col w-full max-w-[320px] p-4 border-gray-200 bg-gray-100 rounded-xl dark:bg-gray-700">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {senderName || "User"}
          </span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Message Content */}
        {type === "text" && (
          <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{message}</p>
        )}
        {type === "audio" && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse py-2.5">
            {/* Audio Playback UI */}
            <button
              className="inline-flex self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-white focus:ring-4 dark:bg-gray-700 dark:hover:bg-gray-600"
              type="button"
            >
              <svg
                className="w-4 h-4 text-gray-800 dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 12 16"
              >
                <path d="M3 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm7 0H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
              </svg>
            </button>
            <svg className="w-32 h-8 dark:fill-gray-400" viewBox="0 0 185 40" xmlns="http://www.w3.org/2000/svg">
              <rect y="17" width="3" height="6" rx="1.5" fill="#6B7280" />
              {/* Add other rectangles for the waveform */}
            </svg>
            <span className="text-sm text-gray-900 dark:text-white">{status}</span>
          </div>
        )}
        {type === "image" && (
          <div className="group relative my-2.5">
            <img src={media} alt="Sent Media" className="rounded-lg" />
          </div>
        )}
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{status}</span>
      </div>
    </div>
  );
};

export default ChatBubble;