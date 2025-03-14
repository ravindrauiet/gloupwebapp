import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const ImageSearchComponent = ({ onSearch }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [resultLimit, setResultLimit] = useState(24);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file) => {
    setError('');
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    
    // Add the limit parameter to the image search
    const imageWithLimit = Object.assign(selectedImage, { limit: resultLimit });
    onSearch(imageWithLimit);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLimitChange = (e) => {
    setResultLimit(parseInt(e.target.value));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Similar Products</h2>
      <p className="text-gray-600 mb-6">Upload an image of a dress to find similar thrift items</p>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${previewUrl ? 'pt-4' : 'pt-8'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="mb-4">
            <div className="max-w-[300px] mx-auto rounded-md overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-auto object-contain" 
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedImage?.name} ({(selectedImage?.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <svg 
              className="w-16 h-16 text-gray-400 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-gray-600 mb-2">Drag and drop your image here</p>
            <p className="text-gray-500 text-sm mb-4">or</p>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={handleButtonClick}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {previewUrl ? 'Choose a different image' : 'Browse files'}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 mt-6">
        <div className="flex-grow">
          <label htmlFor="resultLimit" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Results
          </label>
          <select
            id="resultLimit"
            value={resultLimit}
            onChange={handleLimitChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="12">12 items</option>
            <option value="24">24 items</option>
            <option value="36">36 items</option>
            <option value="48">48 items</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!selectedImage}
            className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 ${
              !selectedImage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            Clear
          </button>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedImage}
            className={`px-6 py-2 rounded-md ${
              !selectedImage 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            Search Similar Products
          </button>
        </div>
      </div>
    </div>
  );
};

ImageSearchComponent.propTypes = {
  onSearch: PropTypes.func.isRequired
};

export default ImageSearchComponent; 