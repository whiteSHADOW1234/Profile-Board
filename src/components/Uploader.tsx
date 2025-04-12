import { useState, useRef, DragEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UploadedSvg } from '../types';
import { isValidSvg } from '../utils/svgUtils';

interface UploaderProps {
  onSvgUpload: (svg: UploadedSvg) => void;
}

const Uploader = ({ onSvgUpload }: UploaderProps) => {
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

  const processSvgFile = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Create an object URL first
      const url = URL.createObjectURL(file);
      
      // Read file content
      const content = await file.text();
      
      if (!isValidSvg(content)) {
        URL.revokeObjectURL(url);
        alert('Invalid SVG file.');
        return;
      }
      
      // Create a new SVG object
      const newSvg: UploadedSvg = {
        id: uuidv4(),
        url,
        content
      };
      
      onSvgUpload(newSvg);
    } catch (err) {
      console.error('Error processing SVG file:', err);
      alert('Error processing SVG file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'image/svg+xml') {
        processSvgFile(file);
      } else {
        alert('Please drop an SVG file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'image/svg+xml') {
        processSvgFile(file);
      } else {
        alert('Please select an SVG file.');
      }
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      alert('Please enter a URL.');
      return;
    }

    try {
      setIsLoading(true);
      
      // First check if URL is reachable
      const response = await fetch(urlInput, { method: 'GET' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      // Check content type if available
      if (contentType && !contentType.includes('image/svg+xml') && !contentType.includes('text/xml') && !contentType.includes('application/xml')) {
        console.warn('Warning: Resource might not be an SVG based on Content-Type:', contentType);
      }
      
      // Get content
      const content = await response.text();
      
      if (!isValidSvg(content)) {
        alert('The URL does not point to a valid SVG.');
        return;
      }
      
      // Create new SVG object
      const newSvg: UploadedSvg = {
        id: uuidv4(),
        url: urlInput,
        content
      };
      
      onSvgUpload(newSvg);
      setUrlInput('');
    } catch (err) {
      console.error('Error fetching SVG from URL:', err);
      alert(`Error fetching SVG: ${(err as Error).message}`);
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
          <p className="text-gray-500">Drag & drop SVG here<br/>or click to browse</p>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/svg+xml"
          onChange={handleFileInputChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">Or enter SVG URL:</p>
        <div className="flex">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://../../file.svg"
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleUrlUpload}
            className={`px-3 py-2 bg-blue-500 text-white rounded-r font-medium text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Uploader;