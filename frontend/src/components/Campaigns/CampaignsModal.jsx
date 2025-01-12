import React, { useEffect, useState } from "react";
import Modal from "../Common/Modal";
import Alert from "../Common/Alert";
import FileUpload from "../Common/FileUpload";
import { fetchPromotions, fetchRemainders, createCampaigns, uploadFile } from "../../utils/api";
import Quantity from "../Common/Quantity";

const CreateCampaignModal = ({ onClose, onCampaignCreated}) => {
  const [excelFile, setExcelFile] = useState(null);
  const [alert, setAlert] = useState(null);
  const [scheduleCampaign, setScheduleCampaign] = useState(false);
  const [runAfterSave, setRunAfterSave] = useState(false);
  const [repeatCampaign, setRepeatCampaign] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedActivityType, setSelectedActivityType] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerDate, setTriggerDate] = useState("");
  const [triggerTime, setTriggerTime] = useState("");
  const [repeatCount, setRepeatCount] = useState(0);
  const [repeatIntervalValue, setRepeatIntervalValue] = useState(0);
  const [repeatIntervalUnit, setRepeatIntervalUnit] = useState("MINUTES");
  const [uploadedFilePath, setUploadedFilePath] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        let data = [];
        if (selectedActivityType === "promotion") {
          data = await fetchPromotions();
        } else if (selectedActivityType === "remainder") {
          data = await fetchRemainders();
        }
        setActivities(data);
        // setSelectedActivity(data.length > 0 ? data[0].id : ""); // Set default activity
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    if (selectedActivityType) {
      fetchActivities();
    }
  }, [selectedActivityType]);


  const handleExcelFileChange = (file) => {
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel") {
        setExcelFile(file);
        setAlert({ type: "success", message: `${file.name} added, uploading to server...` });
        handleFileUpload(file)
      } else {
        setAlert({ type: "error", message: "Invalid file type. Only Excel files are allowed." });
      }
    }
    else {
      setExcelFile(file);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const data = await uploadFile(file);
      if (data) {
        setUploadedFilePath(data.file);
        setAlert({ type: "success", message: "File uploaded successfully!" });
      } else {
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setAlert({ type: "error", message: "Failed to upload file." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate repeatIntervalUnit
    const validUnits = ["MINUTES", "HOURS", "DAYS"];
    if (!validUnits.includes(repeatIntervalUnit.toUpperCase())) {
      setAlert({ type: "error", message: "Invalid repeat interval unit selected." });
      return;
    }
  
    const requestBody = {
      id: campaignName.toLowerCase().replace(/\s+/g, "_"),
      name: campaignName,
      is_active: !scheduleCampaign,
      schedule_at: scheduleCampaign ? `${triggerDate}T${triggerTime}:00` : null,
      activity_type: selectedActivityType.toUpperCase(),
      activity_id: selectedActivity,
      repeat_count: repeatCampaign ? repeatCount : 0,
      repeat_interval_value: repeatCampaign ? repeatIntervalValue : null,
      repeat_interval_unit: repeatCampaign ? repeatIntervalUnit.toUpperCase() : null,
      customer_excel_file: uploadedFilePath,
      created_by: "APFS0001",
    };
  
    try {
      const response = await createCampaigns(requestBody);
      if (response) {
        setAlert({ type: "success", message: "Campaign created successfully!" });
        if (onCampaignCreated) onCampaignCreated();
        setTimeout(() => onClose(), 300);
      } else {
        setAlert({ type: "error", message: "Failed to create campaign." });
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setAlert({ type: "error", message: "An unexpected error occurred." });
    }
  };
  

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 100); 
  };


  return (
    <Modal onClose={handleClose} header={"Create New Campaign"}>

      <div className={` transition-all duration-300 ease-in-out ${
          isClosing ? "opacity-0 scale-0" : "opacity-100 scale-100"
      }`}>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form className="space-y-4" onSubmit={handleSubmit}>

        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">

          {/* Campaign Name */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Campaign Name</span>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200 focus:ring-focus focus:border-focus sm:text-sm"
              placeholder="Enter campaign name"
              required
              />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded border-gray-200 focus:ring-focus focus:border-focus sm:text-sm"
              placeholder="Enter description"
              required
              />
          </label>

        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 col-span-2 gap-4">

          {/* Row 2.1 */}
          <div className="col-span-1">
            {/* Toggle */}
            <div className="flex flex-row gap-6 justify-start">

              <div className="flex flex-col items-start gap-2 p-4 border border-gray-200 rounded-lg hover:border-focus">
                  <span className="text-sm font-medium text-gray-700">Run after save</span>
                  <label
                    htmlFor="run_after_save"
                    className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-focus"
                    >
                      <input type="checkbox" id="run_after_save" className="peer sr-only" checked={runAfterSave} onChange={(e) => setRunAfterSave(e.target.checked)} />
                      <span className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-all peer-checked:start-6"></span>
                  </label>
              </div>

              <div className="flex flex-col items-start gap-2 p-4 border border-gray-200 rounded-lg hover:border-focus">
                <span className="text-sm font-medium text-gray-700">Schedule Campaign</span>
                <label
                  htmlFor="campaign_scheduler"
                  className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-focus"
                  >
                    <input type="checkbox" id="campaign_scheduler" className="peer sr-only" checked={scheduleCampaign} onChange={(e) => setScheduleCampaign(e.target.checked)} />
                    <span className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-all peer-checked:start-6"></span>
                </label>
              </div>

              <div className="flex flex-col items-start gap-2 p-4 border border-gray-200 rounded-lg hover:border-focus">
                <span className="text-sm font-medium text-gray-700">Repeat Campaign</span>
                <label
                  htmlFor="campaign_repeater"
                  className="relative inline-block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition [-webkit-tap-highlight-color:_transparent] has-[:checked]:bg-focus"
                  >
                    <input type="checkbox" id="campaign_repeater" className="peer sr-only" checked={repeatCampaign} onChange={(e) => setRepeatCampaign(e.target.checked)} />
                    <span className="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-all peer-checked:start-6"></span>
                </label>
              </div>

            </div>

          </div>

          {/* Row 2.2 */}
          <div className="col-span-1">

            {/* Campaign Scheduler */}
            <div
              className={`grid grid-cols-2 col-span-1 gap-4 transform transition-all duration-300 ease-in-out overflow-hidden ${
                scheduleCampaign ? "opacity-100 max-h-screen scale-100" : "opacity-0 max-h-0 scale-95 m-0 p-0"
              }`}>

              {/* Trigger On Date */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Scheduled On Date</span>
                <input
                  type="date"
                  value={triggerDate}
                  onChange={(e) => setTriggerDate(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-200 focus:ring-focus focus:border-focus sm:text-sm"
                  required
                  />
              </label>

              {/* Trigger At Time */}
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Scheduled At Time</span>
                <input
                  type="time"
                  value={triggerTime}
                  onChange={(e) => setTriggerTime(e.target.value)}
                  className="mt-1 block w-full rounded border-gray-200 focus:ring-focus focus:border-focus sm:text-sm selected"
                  required
                  />
              </label>

            </div>

            {/* Campaign Repeater */}
            <div
              className={`grid grid-cols-2 col-span-1 pt-4 gap-4 transform transition-all duration-300 ease-in-out overflow-hidden ${
                repeatCampaign ? "opacity-100 max-h-screen scale-100" : "opacity-0 max-h-0 scale-95 m-0 p-0"
              }`}>

              <Quantity 
                label="Repeat Count"
                lower_limit={1}
                upper_limit={100}
                value={repeatCount}
                onChange={(value) => setRepeatCount(value)}
              />
              
              <Quantity
                label="Repeat Interval"
                lower_limit={1}
                upper_limit={100}
                value={repeatIntervalValue}
                onChange={(value) => setRepeatIntervalValue(value)}
              >
                <label>
                  <select
                    value={repeatIntervalUnit}
                    onChange={(e) => setRepeatIntervalUnit(e.target.value)}
                    className="block w-full text-sm border-l-gray-200 border-white"
                    required
                  >
                    <option value="MINUTES">Minutes</option>
                    <option value="HOURS">Hours</option>
                    <option value="DAYS">Days</option>
                  </select>
                </label>
              </Quantity>

            </div>

          </div>

        </div>


        {/* Row 3 */}
        {/* Activity */}
        <div className="grid grid-cols-2 gap-4 mt-0">

          {/* Activity Type */}
          <label className="block">
              <span className="text-sm font-medium text-gray-700">Activity Type</span>
              <select
                className="mt-1 block w-full rounded border-gray-200 focus:ring-focus
                focus:border-focus
                sm:text-sm"
                value={selectedActivityType}
                onChange={(e) => setSelectedActivityType(e.target.value)}
                required
                >
                <option key="" value="" disabled>Select the kind of activity you want to run</option>
                <option value="remainder">Remainders</option>
                <option value="promotion">Promotions</option>
              </select>
            </label>

          {/* Activity */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Connected Activity</span>
            <select
              className="mt-1 block w-full rounded border-gray-200 focus:ring-focus
              focus:border-focus
              sm:text-sm"
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              required
              >
              <option className="text-gray-600" key="" value="" disabled>Connect activity here</option>

              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>

        </div>



        {/* Upload */}
        <label className="block">
        <span className="text-sm font-medium text-gray-700">Customer Data (Upload Excel)</span>
        </label>

        <FileUpload
          onFileChange={handleExcelFileChange}
          uploadedFile={excelFile}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          placeholder="Drop your Excel file here 📥"
          />

        {/* Form Actions */}
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 mr-2"
            onClick={handleClose}
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

      </form>
      </div>
    </Modal>
  );
};

export default CreateCampaignModal;
