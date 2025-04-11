import { useState } from 'react';
import { UploadedSvg } from '../types';

interface SvgPreviewListProps {
  svgs: UploadedSvg[];
  onAddToCanvas: (svg: UploadedSvg) => void;
}

const SvgPreviewList = ({ svgs, onAddToCanvas }: SvgPreviewListProps) => {
  const [draggingSvg, setDraggingSvg] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, svg: UploadedSvg) => {
    e.dataTransfer.setData('application/json', JSON.stringify(svg));
    setDraggingSvg(svg.id);
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
            {svg.content ? (
              <div 
                dangerouslySetInnerHTML={{ __html: svg.content }}
                className="w-full h-full"
              />
            ) : (
              <img 
                src={svg.url} 
                alt="SVG Preview" 
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SvgPreviewList;