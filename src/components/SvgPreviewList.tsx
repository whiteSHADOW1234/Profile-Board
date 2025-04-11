import { useState } from 'react';
import { UploadedSvg } from '../types';

interface SvgPreviewListProps {
  svgs: UploadedSvg[];
  onAddToCanvas: (svg: UploadedSvg) => void;
}

const SvgPreviewList = ({ svgs, onAddToCanvas }: SvgPreviewListProps) => {
  const [draggingSvg, setDraggingSvg] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, svg: UploadedSvg) => {
    // Only transfer the minimal data needed
    const transferData = {
      id: svg.id,
      url: svg.url
    };
    e.dataTransfer.setData('application/json', JSON.stringify(transferData));
    setDraggingSvg(svg.id);
    
    // Set drag image (optional - can improve UX)
    const dragImg = new Image();
    dragImg.src = svg.url;
    e.dataTransfer.setDragImage(dragImg, 25, 25);
  };

  const handleDragEnd = () => {
    setDraggingSvg(null);
  };

  const handleDoubleClick = (svg: UploadedSvg) => {
    onAddToCanvas(svg);
  };

  if (svgs.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        No SVGs uploaded yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {svgs.map((svg) => (
        <div 
          key={svg.id}
          className={`
            p-2 border rounded bg-white cursor-grab
            ${draggingSvg === svg.id ? 'opacity-50' : ''}
          `}
          draggable
          onDragStart={(e) => handleDragStart(e, svg)}
          onDragEnd={handleDragEnd}
          onDoubleClick={() => handleDoubleClick(svg)}
          title="Drag to canvas or double-click to add"
        >
          <div className="h-16 flex items-center justify-center p-1">
            {/* Just use the URL for preview, it's safer than rendering potentially complex SVG content */}
            <img 
              src={svg.url} 
              alt="SVG Preview" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SvgPreviewList;