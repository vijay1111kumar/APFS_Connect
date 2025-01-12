import React, { useEffect, useState } from "react";
import Modal from "../Common/Modal";
import Alert from "../Common/Alert";
import FileUpload from "../Common/FileUpload"; // Reusable component
import { fetchFlows, createPromotion } from "../../utils/api";

const PromotionsModal = ({ onClose, onPromotionCreated, setGlobalAlert }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileURL, setUploadedFileURL] = useState(null); // URL for image preview
  const [alert, setAlert] = useState(null);
  const [category, setCategory] = useState("personalised");
  const [messageType, setMessageType] = useState("text");
  const [flows, setFlows] = useState([]); // Flow dropdown options
  const [selectedFlow, setSelectedFlow] = useState("");
  const [header, setHeader] = useState("");
  const [description, setDescription] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [footer, setFooter] = useState("");
  const [promotionName, setPromotionName] = useState("");
  const [isClosing, setIsClosing] = useState(false); // For closing animation
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFlows();
        setFlows(data);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchData();
  }, []);

  const handleFileValidation = (file, type) => {
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name;

    const validations = {
      image: ["image/jpeg", "image/png", "image/jpg"],
      audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
      video: ["video/mp4", "video/mpeg", "video/avi"],
      text: ["text/plain"],
    };

    if (!validations[type].includes(fileType)) {
      setAlert({ type: "error", message: `Invalid file type for ${type}.` });
      return false;
    }

    setAlert({ type: "success", message: `${fileName} uploaded successfully.` });
    return true;
  };

  const handleMessageFileChange = (file) => {
    if (handleFileValidation(file, messageType)) {
      setUploadedFile(file);
      setMessageBody(file.name); // Update message body preview with file name

      // Generate preview URL for images
      if (messageType === "image") {
        const fileURL = URL.createObjectURL(file);
        setUploadedFileURL(fileURL);
      } else {
        setUploadedFileURL({}); // Reset if not an image
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      id: promotionName.toLowerCase().replace(/\s+/g, "_"),
      name: promotionName,
      description: description,
      connected_flow: selectedFlow,
      promotion_type: category,
      header_message: header,
      footer_message: footer,
      message_body_type: messageType.toUpperCase(),
      message_body: messageBody,
      is_active: true,
      created_by: "APFS0001", // This should ideally come from the authenticated user context
    };

    try {
      const response = await createPromotion(requestBody); 
      if (response) {
        setGlobalAlert({ type: "success", message: "Promotion created successfully!" });
        onPromotionCreated(); // Refresh PromotionsTable
        setIsClosing(true); // Trigger closing animation
        setTimeout(onClose, 300); // Close modal after animation
      } else {
        setAlert({ type: "error", message: "Failed to create promotion." });
      }
    } catch (error) {
      console.error("Error creating promotion:", error);
      setAlert({ type: "error", message: "An unexpected error occurred." });
    }
  };


  return (
    <Modal header="Create Promotion" onClose={onClose} >

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit}>
        <div className="space-x-12 grid grid-cols-2">

          {/* Column 1 */}
          <div className="space-y-6 sm:space-y-4">

            {/* Promotion Name */}
            <div>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Promotional Name</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Enter promotion name"
                  value={promotionName}
                  onChange={(e) => setPromotionName(e.target.value)}
                  required
                />
              </label>
            </div>

            {/* Description */}
            <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            </div>

            {/* Flow and Message type */}
            <div className="grid grid-cols-2 gap-4">
            <label className="block">
                <span className="text-sm font-medium text-gray-700">Flow</span>
                <select
                  defaultValue={null}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  value={selectedFlow}
                  onChange={(e) => setSelectedFlow(e.target.value)}
                >
                  <option key="" value="" disabled>Select the flow you want to connect</option>
                  {flows.map((flow) => (
                    <option key={flow.id} value={flow.id}>
                      {flow.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message Type</span>
                <select
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
              </label>
            </div>

            {/* Header */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Header</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter header"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
              />
            </label>

            {/* Message */}
            {messageType === "text" ? (
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Enter your message"
                  rows="3"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                ></textarea>
              </label>
            ) : (
              <FileUpload onFileChange={handleMessageFileChange} messageType={messageType} uploadedFile={uploadedFile} placeholder={"Drop your file here 📥"} />
            )}

            {/* Footer */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Footer</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter footer"
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
              />
            </label>

          </div>

          {/* Column 2 */}
          <div className="space-y-4 sm:space-y-3 flex flex-col justify-between">

            {/* Message Preview */}
            <div className="whatsapp-container rounded-lg">
            <span className="text-sm font-medium text-gray-700">Message Preview</span>

              {/* Header */}
              <div className="whatsapp-header flex items-center justify-between p-4 mt-1 bg-[#f0f2f5] shadow-md">
                <div className="flex items-center gap-3">
                  {/* Profile Picture */}
                  <img
                    src="L2W_Connect.png" // Replace with profile pic URL
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-800">L2W Connect</p>
                    <p className="text-sm text-gray-600">India's finest FinTech</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Search Icon */}
                  <svg
                    className="w-6 h-6 text-gray-600 cursor-pointer"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                  <path fill="currentColor" d="M15.9,14.3H15L14.7,14c1-1.1,1.6-2.7,1.6-4.3c0-3.7-3-6.7-6.7-6.7S3,6,3,9.7 s3,6.7,6.7,6.7c1.6,0,3.2-0.6,4.3-1.6l0.3,0.3v0.8l5.1,5.1l1.5-1.5L15.9,14.3z M9.7,14.3c-2.6,0-4.6-2.1-4.6-4.6s2.1-4.6,4.6-4.6 s4.6,2.1,4.6,4.6S12.3,14.3,9.7,14.3z"></path>
                  </svg>
                  {/* Three Dots */}
                  <svg
                    className="w-6 h-6 text-gray-600 cursor-pointer"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                  <path fill="currentColor" d="M12,7c1.104,0,2-0.896,2-2c0-1.105-0.895-2-2-2c-1.104,0-2,0.894-2,2 C10,6.105,10.895,7,12,7z M12,9c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,9.895,13.104,9,12,9z M12,15 c-1.104,0-2,0.894-2,2c0,1.104,0.895,2,2,2c1.104,0,2-0.896,2-2C13.999,15.894,13.104,15,12,15z"></path>
                  </svg>
                </div>
              </div>

              {/* Chat Section */}
              <div className="whatsapp-chat relative overflow-hidden">
                {/* Chat Background */}
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    backgroundImage: `url('whatsapp_background.png')`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "#efeae2",
                  }}
                ></div>

                <div className="relative p-4">
                  {/* Message */}
                  <div className="whatsapp-message bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-800">{header}</p>
                    {messageType === "text" ? (
                      <p className="mt-2 text-gray-700 text-wrap break-words max-w-fit text-sm">{messageBody}</p>
                    ) : messageType === "image" && uploadedFileURL ? (
                      <img
                        src={uploadedFileURL}
                        alt="Uploaded"
                        className="w-full max-w-[150px] max-h-[350px] object-contain mt-2"
                      />
                    ) : null}
                    <p className="mt-2 text-xs text-gray-500">{footer}</p>
                    <span className="absolute bottom-7 right-7 text-xs text-gray-600">12:34 PM</span>
                  </div>
                </div>
              </div>
            </div>
          
            {/* Form Actions */}
            <div className="flex justify-end">
              <button
                type="button"
                className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 mr-2"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-highlight"
              >
                Submit
              </button>
            </div>

          </div>

        </div>

      </form>
    </Modal>
  );
};

export default PromotionsModal;
