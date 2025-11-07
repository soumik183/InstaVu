import { useState, useRef } from 'react';
import { useStorage } from '../../context/StorageContext';
import { useApiKeys } from '../../context/ApiContext';
import {
  Close,
  Upload,
  CheckCircle,
  ErrorCircle,
  LoadingSpinner,
} from '../../assets/icons';
import { formatFileSize, validateFile } from '../../utils/fileHelpers';
import { useToast } from '../common/Toast';

export default function FileUpload({ onClose }) {
  const { uploadFile } = useStorage();
  const { apiKeys } = useApiKeys();
  const { showToast, ToastContainer } = useToast();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFilesToQueue(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFilesToQueue(files);
  };

  const addFilesToQueue = (files) => {
    const validFiles = files.map((file) => {
      const validation = validateFile(file);
      return {
        id: Date.now() + Math.random(),
        file,
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.valid ? null : validation.errors[0],
      };
    });

    setUploadQueue((prev) => [...prev, ...validFiles]);
  };

  const removeFromQueue = (id) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpload = async () => {
    if (apiKeys.length === 0) {
      showToast('Please add at least one API key first', 'error');
      return;
    }

    setUploading(true);

    for (const item of uploadQueue) {
      if (item.status === 'error') continue;

      try {
        // Update status to uploading
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i
          )
        );

        // Upload file
        await uploadFile(item.file);

        // Update status to complete
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'complete', progress: 100 } : i
          )
        );

        showToast(`${item.file.name} uploaded successfully`, 'success');
      } catch (error) {
        // Update status to error
        setUploadQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', error: error.message }
              : i
          )
        );

        showToast(`Failed to upload ${item.file.name}`, 'error');
      }
    }

    setUploading(false);

    // Close modal after all uploads complete
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ErrorCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <LoadingSpinner className="w-5 h-5 text-primary-600" />;
      default:
        return null;
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Upload Files</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Close className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Drop Zone */}
            {uploadQueue.length === 0 && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-gray-500">
                  Supports: Photos, Videos, Documents
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
              <div className="space-y-3">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {getStatusIcon(item.status)}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">
                        {item.file.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(item.file.size)}
                      </p>

                      {/* Progress Bar */}
                      {item.status === 'uploading' && (
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      )}

                      {/* Error Message */}
                      {item.error && (
                        <p className="text-sm text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>

                    {/* Remove Button */}
                    {item.status === 'pending' && (
                      <button
                        onClick={() => removeFromQueue(item.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Close className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add More Button */}
                {!uploading && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-400 hover:bg-gray-50 transition text-gray-600"
                  >
                    + Add more files
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          {uploadQueue.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {uploadQueue.length} file(s) •{' '}
                {formatFileSize(
                  uploadQueue.reduce((sum, item) => sum + item.file.size, 0)
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={uploading}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={
                    uploading ||
                    uploadQueue.filter((i) => i.status === 'pending').length === 0
                  }
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <LoadingSpinner className="w-5 h-5" />}
                  {uploading ? 'Uploading...' : 'Upload All'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}