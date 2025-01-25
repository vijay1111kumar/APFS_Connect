import React, { useState } from "react";
import MessagePreview from "./MessagePreview";

const FlowBuilder = () => {
  const [flow, setFlow] = useState({
    name: "New Flow",
    id: "new_flow",
    trigger: "",
    start: "step1",
    steps: [],
    is_active: true,
  });

  const addStep = () => {
    const newStep = {
      id: `step${flow.steps.length + 1}`,
      name: `Step ${flow.steps.length + 1}`,
      sequence_no: flow.steps.length + 1,
      type: "message",
      action: "send_message",
      next_step: null,
      is_active: true,
      content: { type: "text", body: "" },
      processor: [],
    };
    setFlow((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const updateStep = (index, updatedStep) => {
    const updatedSteps = flow.steps.map((step, i) =>
      i === index ? updatedStep : step
    );
    setFlow((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const deleteStep = (index) => {
    const updatedSteps = flow.steps.filter((_, i) => i !== index);
    setFlow((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleSave = () => {
    const jsonFlow = JSON.stringify(flow, null, 2);
    console.log("Saved Flow:", jsonFlow);
    alert("Flow saved! Check console for JSON output.");
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel: Configuration */}
      <div className="w-1/2 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Flow Builder</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Flow Name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            value={flow.name}
            onChange={(e) => setFlow({ ...flow, name: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Trigger</label>
          <input
            type="text"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
            value={flow.trigger}
            onChange={(e) => setFlow({ ...flow, trigger: e.target.value })}
          />
        </div>
        <button
          className="mb-4 w-full bg-blue-500 text-white py-2 rounded-lg shadow hover:bg-blue-600"
          onClick={addStep}
        >
          Add Step
        </button>
        {flow.steps.map((step, index) => (
          <div key={index} className="p-4 mb-4 bg-white shadow rounded-lg">
            <h3 className="text-sm font-medium mb-2">Step {index + 1}</h3>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                value={step.name}
                onChange={(e) =>
                  updateStep(index, { ...step, name: e.target.value })
                }
              />
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700">Content Type</label>
              <select
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                value={step.content.type}
                onChange={(e) =>
                  updateStep(index, {
                    ...step,
                    content: { ...step.content, type: e.target.value },
                  })
                }
              >
                <option value="text">Text</option>
                <option value="interactive">Interactive</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700">Body</label>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                value={step.content.body}
                onChange={(e) =>
                  updateStep(index, {
                    ...step,
                    content: { ...step.content, body: e.target.value },
                  })
                }
              />
            </div>
            <button
              className="mt-2 w-full bg-red-500 text-white py-1 rounded-lg shadow hover:bg-red-600"
              onClick={() => deleteStep(index)}
            >
              Delete Step
            </button>
          </div>
        ))}
        <button
          className="w-full bg-green-500 text-white py-2 rounded-lg shadow hover:bg-green-600"
          onClick={handleSave}
        >
          Save Flow
        </button>
      </div>

      {/* Right Panel: Live Preview */}
      <div className="w-1/2 bg-gray-50 p-4">
        <h2 className="text-lg font-semibold mb-4">Flow Preview</h2>
        <MessagePreview flow={flow} />
      </div>
    </div>
  );
};

export default FlowBuilder;
