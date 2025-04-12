// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\DemoSvg.tsx
import { v4 as uuidv4 } from 'uuid';
import { UploadedAsset } from '../types'; // Updated import

interface DemoSvgProps {
  onAddDemo: (asset: UploadedAsset) => void; // Updated type
}

const DemoSvg = ({ onAddDemo }: DemoSvgProps) => {
  const handleAddDemo = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="10" y="10" width="80" height="80" fill="#4f46e5" rx="10" />
        <circle cx="50" cy="50" r="25" fill="#ffffff" />
      </svg>
    `;

    // Create a Blob URL for consistency, though not strictly necessary if content is present
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    onAddDemo({
      id: uuidv4(),
      url: url, // Use blob URL
      type: 'svg', // Explicitly set type
      content: svgContent
    });
    // Note: Blob URL should ideally be revoked later if the asset is removed,
    // but for a demo it might be acceptable to omit cleanup.
  };

  return (
    <button
      onClick={handleAddDemo}
      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
    >
      {/* ... button icon ... */}
      Add Demo SVG
    </button>
  );
};

export default DemoSvg;
