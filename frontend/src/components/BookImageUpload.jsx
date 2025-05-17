import { useState } from 'react';
import PropTypes from 'prop-types';

const BookImageUpload = ({ onImageSelect, initialImage }) => {
  const [previewImage, setPreviewImage] = useState(initialImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    // Reset states
    setErrorMessage('');
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/PNG', 'image/JPEG', 'image/JPG', 'image/WEBP', 'image/GIF'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image (JPEG, JPG or PNG)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 2MB');
      return;
    }
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Pass the file to parent component
    onImageSelect(file);
  };

  return (
    <div className="book-image-upload">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="book-cover">
          Book Cover Image
        </label>
        
        <div className="flex items-center space-x-4">
          {/* Image preview */}
          {previewImage && (
            <div className="relative w-32 h-40 border rounded overflow-hidden">
              <img 
                src={previewImage} 
                alt="Book cover preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Upload button */}
          <div className="flex-1">
            <input
              type="file"
              id="book-cover"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="book-cover"
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded inline-block"
            >
              {isUploading ? 'Uploading...' : previewImage ? 'Change Image' : 'Upload Image'}
            </label>
            
            {errorMessage && (
              <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
            )}
            
            <p className="text-gray-500 text-xs mt-1">
              Recommended size: 500x600 pixels. Max 2MB. JPG or PNG only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

BookImageUpload.propTypes = {
  onImageSelect: PropTypes.func.isRequired,
  initialImage: PropTypes.string
};

export default BookImageUpload; 