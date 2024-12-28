import React, { useEffect, useState } from "react";
import Modal from "../Common/Modal";
import Alert from "../Common/Alert";
import FileUpload from "../Common/FileUpload"; // Reusable component

const CreatePromotionModal = ({ onClose }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null); // For Excel upload
  const [alert, setAlert] = useState(null);
  const [category, setCategory] = useState("personalised");
  const [messageType, setMessageType] = useState("text");
  const [flows, setFlows] = useState([]); // Flow dropdown options
  const [selectedFlow, setSelectedFlow] = useState("");

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch("/flow"); // Replace with your API function if needed
        const data = await response.json();
        setFlows(data);
        setSelectedFlow(data.length > 0 ? data[0].id : "");
      } catch (error) {
        console.error("Error fetching flows:", error);
      }
    };

    fetchFlows();
  }, []);

  const handleFileValidation = (file, type) => {
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name;

    const validations = {
      image: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
      video: ["video/mp4", "video/mpeg", "video/avi"],
      text: ["text/plain", "application/pdf"],
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
    }
  };

  const handleExcelFileChange = (file) => {
    if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel") {
      setExcelFile(file);
      setAlert({ type: "success", message: `${file.name} uploaded successfully.` });
    } else {
      setAlert({ type: "error", message: "Invalid file type. Only Excel files are allowed." });
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold mb-4">Create New Promotion</h2>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Promotional Name</span>
          <input
            type="text"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter promotion name"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Trigger On Date</span>
            <input
              type="date"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Trigger At Time</span>
            <input
              type="time"
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Category</span>
            <select
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="personalised">Personalised</option>
              <option value="common">Common</option>
              <option value="default">Default</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Message Type</span>
            <select
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

        {category !== "personalised" && (
          <>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Flow</span>
              <select
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedFlow}
                onChange={(e) => setSelectedFlow(e.target.value)}
                required
              >
                {flows.map((flow) => (
                  <option key={flow.id} value={flow.id}>
                    {flow.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Header</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter header"
              />
            </label>

            {messageType === "text" ? (
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Message</span>
                <textarea
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your message"
                  rows="4"
                ></textarea>
              </label>
            ) : (
              <FileUpload onFileChange={handleMessageFileChange} messageType={messageType} uploadedFile={uploadedFile} />
            )}

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Footer</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter footer"
              />
            </label>
          </>
        )}

        <FileUpload
          onFileChange={handleExcelFileChange}
          uploadedFile={excelFile}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          placeholder="Drag and drop an Excel file here or click to upload"
        />

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
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePromotionModal;
