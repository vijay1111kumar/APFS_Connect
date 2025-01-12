import React from "react";

const FileUpload = ({ onFileChange, uploadedFile, placeholder, accept }) => (
  <div
    onDrop={(e) => {
      e.preventDefault();
      onFileChange(e.dataTransfer?.files[0]);
    }}
    onDragOver={(e) => e.preventDefault()}
    className="mt-4 w-full h-20 rounded border border-dashed border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
  >
    {uploadedFile ? (
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 border rounded text-sm font-medium text-gray-700">
          {uploadedFile.name}
        </span>
        <button
          type="button"
          onClick={() => onFileChange(null)}
          className="text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      </div>
    ) : (
      <>
        <span>{placeholder}</span>
        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files[0])}
          className="hidden"
          accept={accept}
        />
      </>
    )}
  </div>
);

export default FileUpload;
