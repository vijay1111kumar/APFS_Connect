import React, { useState } from "react";
import Modal from "../Common/Modal";
import Alert from "../Common/Alert";
import FileUpload from "../Common/FileUpload";
import MessagePreview from "./MessagePreview";
import { createFlow, uploadFile } from "../../utils/api";

const FlowModal = ({ onClose, onFlowCreated, setGlobalAlert }) => {
  const [alert, setAlert] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(""); // File name display
  const [flowName, setFlowName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isClosing, setIsClosing] = useState(false); // For closing animation
  const [flowContent, setFlowContent] = useState(null)

  const handleFileChange = async (file) => {
    try {
      setAlert(null);

      // Read the file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsedContent = JSON.parse(e.target.result); // Parse JSON content
          setFlowContent(parsedContent); // Update state with flow content
          setUploadedFileName(file.name);
          setUploadedFile(file);

          // Optionally, upload the file to the server
          const response = await uploadFile(file);
          if (response) {
            setAlert({ type: "success", message: `${file.name} uploaded successfully.` });
          }
        } catch (error) {
          setAlert({ type: "error", message: "Invalid JSON file content." });
          console.error("Error parsing JSON file:", error);
        }
      };

      reader.onerror = () => {
        setAlert({ type: "error", message: "Failed to read the file." });
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("File upload failed:", error);
      setAlert({ type: "error", message: "Failed to upload file." });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      id: flowName.toLowerCase().replace(/\s+/g, "_"),
      name: flowName,
      trigger,
      is_active: isActive,
      flow_file: uploadedFile?.name || "", // Use uploaded file's reference
      created_by: "APFS0001", // Replace with the authenticated user context
    };

    try {
      const response = await createFlow(requestBody);
      if (response) {
        setGlobalAlert({ type: "success", message: "Flow created successfully!" });
        onFlowCreated(); // Refresh FlowsTable
        setIsClosing(true); // Trigger closing animation
        setTimeout(onClose, 300); // Close modal after animation
      } else {
        setAlert({ type: "error", message: "Failed to create flow." });
      }
    } catch (error) {
      console.error("Error creating flow:", error);
      setAlert({ type: "error", message: "An unexpected error occurred." });
    }
  };

  return (
    <Modal header="Create Flow" onClose={onClose}>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit}>
        <div className="lg:space-x-8 sm:space-x-0 grid grid-cols-2 overflow-auto mb-8">
          {/* Column 1 */}
          <div className=" lg:col-span-1 space-y-6 sm:space-y-4 sm:col-span-2 ">
            {/* Flow Name */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Flow Name</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter flow name"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                required
              />
            </label>

            {/* Trigger */}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Trigger</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Enter trigger"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                required
              />
            </label>

            {/* Active Toggle */}
            <label className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">Is Active</span>
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-primary"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </label>

            {/* File Upload */}
            <FileUpload
              onFileChange={handleFileChange}
              uploadedFile={uploadedFile}
              placeholder={"Drop your file here 📥"}
              accept="application/json"
            />
          </div>

          {/* Column 2 */}
          <div className="sm:space-y-3 lg:col-span-1 sm:col-span-2 flex flex-col justify-between">

            {/* Message Preview */}
            <div className="whatsapp-container rounded-lg">
              <span className="text-sm font-medium text-gray-700">Message Preview</span>

              <MessagePreview flow={flowContent}/>

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

export default FlowModal;
