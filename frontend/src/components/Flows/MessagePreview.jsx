import React, { useEffect, useState } from "react";

const MessagePreview = ({ flow }) => {
  const [openLists, setOpenLists] = useState({}); // State to track which list is open

  // Reusable Header Component
  const MessageHeader = ({ text }) => {
    if (!text) return null;
    return <p className="text-sm font-medium text-gray-800">{text}</p>;
  };

  // Reusable Body Component
  const MessageBody = ({ text }) => {
    if (!text) return null;
    return (
      <p className="mt-1 text-gray-700 text-wrap break-words max-w-fit text-sm">
        {text}
      </p>
    );
  };

  // Reusable Footer Component
  const MessageFooter = ({ text }) => {
    if (!text) return null;
    return <p className="mt-1 text-xs text-gray-500">{text}</p>;
  };

  // Main Render Function
  const renderStepContent = (step) => {

    if (!step.content) return null;

    const { type, body } = step.content;

    switch (type) {
      case "text":
        return <MessageBody text={body} />;

      case "image":
        return (
          <img
            src={body}
            alt="Step Content"
            className="w-full max-w-[150px] max-h-[350px] object-contain mt-2"
          />
        );

      case "interactive":
        return renderInteractive(body, step);

      default:
        return (
          <p className="mt-2 text-gray-700 text-wrap break-words max-w-fit text-sm">
            Unsupported content type: {type}
          </p>
        );
    }
  };
  
  const renderInteractive = (body, step) => {
    const { header, body: bodyContent, footer, action } = body;

    return (
      <div className="whatsapp-message lg:w-100 sm:w-80 bg-white rounded-lg  py-2 shadow-sm relative">
        <MessageHeader text={header?.text} />
        <MessageBody text={bodyContent?.text} />
        <MessageFooter text={footer?.text} />

        {body.type === "button" && (
          <div className="mt-4 grid grid-cols-2 gap-2">{renderButtons(action)}</div>
        )}
        {body.type === "list" && renderListSection(action, step.id)}

      </div>
    );
  };

  const toggleList = (stepId) => {
    setOpenLists((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const handleOptionSelect = (stepId) => {
    setOpenLists((prev) => ({
      ...prev,
      [stepId]: false, // Closing the list after selection
    }));
  };

  const renderButtons = (action) =>
    action?.buttons?.map((button, index) => (
      <div>
        <button
          key={index}
          type="button" // Preventing form submission
          className="text-sm w-full py-1 font-medium text-white bg-primary rounded shadow hover:bg-highlight"
        >
          {button.reply.title}
        </button>
      </div>
    ));

  const renderListSection = (action, stepId) => {
    const isListOpen = openLists[stepId] || false;

    return (
      <>
        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={() => toggleList(stepId)}
            className="mt-4 w-full py-1 text-sm font-medium text-white bg-primary rounded shadow hover:bg-highlight"
          >
            {action.button}
          </button>
        </div>

        {/* List Section */}
        {isListOpen && (
          <div
            className="absolute top-16 left-0 right-0 bg-gray-50 rounded-lg shadow-md p-4 mt-4 transition-transform duration-300"
            style={{ animation: "slide-in 0.3s ease-in-out" }}
          >
            {action.sections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-2">
                {section.title && (
                  <p className="text-sm font-medium text-gray-800">{section.title}</p>
                )}
                {section.rows.map((row, rowIdx) => (
                  <label
                    key={rowIdx}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <input
                      type="radio"
                      name={`listOption_${stepId}`} // Unique name per list
                      className="form-radio h-4 w-4 text-primary"
                      onClick={() => handleOptionSelect(stepId)}
                    />
                    <span>{row.title}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="whatsapp-container mt-1 rounded-lg">

        <div className="whatsapp-header flex items-center justify-between p-4 bg-[#f0f2f5] shadow-md">
          
          {/* Header */}
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <img src="L2W_Connect.png" className="w-10 h-10 rounded-full" alt="Profile" />
            <div>
              <p className="font-medium text-gray-800">L2W Connect</p>
              <p className="text-sm text-gray-600">India's finest FinTech</p>
            </div>
          </div>
          
          {/* Icons */}
          <div className="flex items-center gap-4">
            <svg
              className="w-6 h-6 text-gray-600 cursor-pointer"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15.9,14.3H15L14.7,14c1-1.1,1.6-2.7,1.6-4.3c0-3.7-3-6.7-6.7-6.7S3,6,3,9.7s3,6.7,6.7,6.7c1.6,0,3.2-0.6,4.3-1.6l0.3,0.3v0.8l5.1,5.1l1.5-1.5L15.9,14.3z M9.7,14.3c-2.6,0-4.6-2.1-4.6-4.6s2.1-4.6,4.6-4.6s4.6,2.1,4.6,4.6S12.3,14.3,9.7,14.3z"></path>
            </svg>
            <svg
              className="w-6 h-6 text-gray-600 cursor-pointer"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12,7c1.104,0,2-0.896,2-2c0-1.105-0.895-2-2-2c-1.104,0-2,0.894-2,2C10,6.105,10.895,7,12,7z M12,9c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,9.895,13.104,9,12,9z M12,15c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,15.894,13.104,15,12,15z"></path>
            </svg>
          </div>
        </div>

      <div className="whatsapp-chat relative overflow-hidden bg-[#f0f2f5] p-4 rounded-lg">
        
        {/* Whatsapp Background */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `url('whatsapp_background.png')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#efeae2",
          }}
        ></div>

        {/* Steps */}
        {!flow ? (
        <div className="min-h-40"></div>
      ) : (
        <div className="relative flex flex-col p-4 space-y-4 h-80 overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-500">
          {flow.steps.map((step) => (
            <div key={step.id}>
              <div className="flex flex-row">
                <div className="whatsapp-message max-w-fit bg-white rounded px-4 py-2 shadow-sm">
                  {renderStepContent(step)}
                </div>
              </div>

              {/* Check for interactive content or processors with 'wait' */}
              {(step.content?.type === "interactive" ||
                step.processor?.some((proc) => proc.wait)) && (
                <div className="flex flex-row-reverse mt-2">
                  <div className="whatsapp-message max-w-fit bg-[#c5e6c1] rounded px-4 py-2 shadow-sm">
                    <p className="text-sm text-gray-700 italic"> User's response...</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      </div>
    </div>
  );
};

export default MessagePreview;
