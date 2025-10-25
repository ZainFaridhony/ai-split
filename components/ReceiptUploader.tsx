import React, { useCallback, useState } from 'react';

// Material Design CloudUpload icon as a React component
const CloudUploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
    </svg>
);


interface ReceiptUploaderProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onImageUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      onImageUpload(files[0]);
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [handleFileChange]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <label
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`w-full max-w-lg p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
      >
        <div className="flex flex-col items-center pointer-events-none">
            <CloudUploadIcon className={`h-16 w-16 mb-4 transition-colors ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
            <h2 className="text-xl font-semibold text-slate-700">
              {isDragging ? 'Drop receipt image here' : 'Click to upload or drag and drop'}
            </h2>
            <p className="text-slate-500 mt-2">PNG, JPG, or WEBP</p>
            <input
              type="file"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={isLoading}
            />
        </div>
      </label>
    </div>
  );
};

export default ReceiptUploader;