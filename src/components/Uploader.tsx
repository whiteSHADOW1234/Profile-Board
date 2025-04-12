// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\Uploader.tsx
import { useState, useRef, DragEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UploadedAsset } from '../types'; // Updated import
import { isValidSvg } from '../utils/svgUtils';

interface UploaderProps {
  onAssetUpload: (asset: UploadedAsset) => void; // Renamed prop
}

// Define accepted image MIME types
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml" // Keep SVG
];
const ACCEPTED_IMAGE_TYPES_STRING = ACCEPTED_IMAGE_TYPES.join(',');


const Uploader = ({ onAssetUpload }: UploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Updated function to handle different file types
  const processFile = async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert(`Unsupported file type: ${file.type}. Please upload JPG, PNG, GIF, WEBP, or SVG.`);
        return;
    }

    setIsLoading(true);
    try {
      const url = URL.createObjectURL(file);
      let content: string | undefined = undefined;
      let type: 'svg' | 'image' = 'image'; // Default to image

      if (file.type === 'image/svg+xml') {
        type = 'svg';
        content = await file.text();
        if (!isValidSvg(content)) {
          URL.revokeObjectURL(url); // Clean up blob URL if invalid
          alert('Invalid SVG file content.');
          setIsLoading(false);
          return;
        }
      }
      // For other image types, we don't need/read content here

      const newAsset: UploadedAsset = {
        id: uuidv4(),
        url,
        type, // Set the determined type
        content // Will be undefined for non-SVGs
      };

      onAssetUpload(newAsset);

    } catch (err) {
      console.error('Error processing file:', err);
      alert('Error processing file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file); // Use the unified processing function
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file); // Use the unified processing function
       // Reset file input value to allow uploading the same file again
       e.target.value = '';
    }
  };

  // Updated URL handler
  const handleUrlUpload = async () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      alert('Please enter a URL.');
      return;
    }

    setIsLoading(true);
    try {
      // We won't fetch content here to validate, as it might be a dynamic image
      // or face CORS issues. We'll let the browser handle loading via the URL.

      // Basic check: does it look like an SVG URL? (imperfect but simple)
    //   const isLikelySvg = trimmedUrl.toLowerCase().endsWith('.svg') || trimmedUrl.includes('svg'); // Simple heuristic

      // For URLs like the GitHub stats, we can't easily get content or reliable type.
      // Assume 'image' unless it clearly ends with .svg. The <image> tag in SvgCanvas
      // can render SVGs via URL anyway.
      const type: 'svg' | 'image' = trimmedUrl.toLowerCase().endsWith('.svg') ? 'svg' : 'image';

      // If it's type 'svg', we *could* try fetching content, but let's keep it simple
      // and only store content for file uploads for now.

      const newAsset: UploadedAsset = {
        id: uuidv4(),
        url: trimmedUrl, // Use the direct URL
        type: type,
        content: undefined // We don't fetch content for URL uploads here
      };

      onAssetUpload(newAsset);
      setUrlInput('');

    } catch (err) {
      // Catch potential errors if we were doing fetch, etc.
      console.error('Error processing URL:', err);
      alert(`Error processing URL: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`uploader-area p-4 rounded text-center cursor-pointer ${isDragging ? 'drag-active' : ''} ${isLoading ? 'opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isLoading ? (
          <p className="text-gray-500">Processing...</p>
        ) : (
          <p className="text-gray-500">Drag & drop Image/SVG here<br/>or click to browse</p> // Updated text
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={ACCEPTED_IMAGE_TYPES_STRING} // Use defined types
          onChange={handleFileInputChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">Or enter Image/SVG URL:</p> {/* Updated text */}
        <div className="flex">
          <input
            type="url" // Use type="url" for better semantics/validation
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://.../image.png" // Updated placeholder
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleUrlUpload}
            className={`px-3 py-2 bg-blue-500 text-white rounded-r font-medium text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Add URL'} {/* Updated text */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
