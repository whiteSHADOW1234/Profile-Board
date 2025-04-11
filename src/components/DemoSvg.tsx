import { v4 as uuidv4 } from 'uuid';
import { UploadedSvg } from '../types';

interface DemoSvgProps {
  onAddDemo: (svg: UploadedSvg) => void;
}

const DemoSvg = ({ onAddDemo }: DemoSvgProps) => {
  const handleAddDemo = () => {
    // A simple SVG shape
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="10" y="10" width="80" height="80" fill="#4f46e5" rx="10" />
        <circle cx="50" cy="50" r="25" fill="#ffffff" />
      </svg>
    `;
    
    onAddDemo({
      id: uuidv4(),
      url: 'demo-svg',
      content: svgContent
    });
  };
  
  return (
    <button
      onClick={handleAddDemo}
      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
    >
      <svg 
        className="w-4 h-4 mr-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      Add Demo SVG
    </button>
  );
};

export default DemoSvg;