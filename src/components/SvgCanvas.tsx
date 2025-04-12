// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\SvgCanvas.tsx
import { useRef, createRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { SvgItem } from '../types';

interface SvgCanvasProps {
  items: SvgItem[];
  onUpdateItem: (item: SvgItem) => void;
  onDropItem: (originalSvgId: string, x: number, y: number) => void;
  onDeleteItem: (itemId: string) => void; // <-- Add prop type for delete handler
}

// Simple 'X' icon component for the delete button
const DeleteIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20" // Keep viewBox for internal coordinates/scaling
      fill="currentColor"
      // Explicitly set width/height (equivalent to w-4 h-4 = 1rem = 16px)
      width="16"
      height="16"
      // Position the icon's top-left corner so its center aligns
      // with the parent <g>'s origin (0,0), which is the circle's center.
      // x = -width/2, y = -height/2
      x="-8"
      y="-8"
      className="text-white" // Keep text color class
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );

const SvgCanvas = ({ items, onUpdateItem, onDropItem, onDeleteItem }: SvgCanvasProps) => { // <-- Destructure onDeleteItem
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef(new Map());

  useEffect(() => {
    const currentIds = new Set(items.map(item => item.id));
    [...nodeRefs.current.keys()].forEach(id => {
      if (!currentIds.has(id as string)) {
        nodeRefs.current.delete(id);
      }
    });
    items.forEach(item => {
      if (!nodeRefs.current.has(item.id)) {
        nodeRefs.current.set(item.id, createRef());
      }
    });
  }, [items]);

  const handleDrag = (_: any, data: any, item: SvgItem) => {
    onUpdateItem({
      ...item,
      x: data.x,
      y: data.y
    });
  };

  const handleResize = (e: React.MouseEvent, item: SvgItem, corner: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent drag start during resize

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = item.width;
    const startHeight = item.height;
    const startItemX = item.x;
    const startItemY = item.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startItemX;
      let newY = startItemY;

      switch(corner) {
        case 'se':
          newWidth = Math.max(30, startWidth + dx);
          newHeight = Math.max(30, startHeight + dy);
          break;
        case 'sw':
          newWidth = Math.max(30, startWidth - dx);
          newX = startItemX + dx;
          newHeight = Math.max(30, startHeight + dy);
          break;
        case 'ne':
          newWidth = Math.max(30, startWidth + dx);
          newHeight = Math.max(30, startHeight - dy);
          newY = startItemY + dy;
          break;
        case 'nw':
          newWidth = Math.max(30, startWidth - dx);
          newHeight = Math.max(30, startHeight - dy);
          newX = startItemX + dx;
          newY = startItemY + dy;
          break;
      }

      // Prevent negative dimensions affecting position during resize
      if (newWidth < 30) {
        if (corner.includes('w')) newX = startItemX + startWidth - 30;
        newWidth = 30;
      }
      if (newHeight < 30) {
         if (corner.includes('n')) newY = startItemY + startHeight - 30;
         newHeight = 30;
      }


      onUpdateItem({
        ...item,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const jsonData = e.dataTransfer.getData('application/json');
      if (!jsonData) return;

      const droppedData: { id: string } = JSON.parse(jsonData);
      const originalSvgId = droppedData.id;

      if (!originalSvgId) {
          console.error('Dropped data does not contain an ID.');
          return;
      }

      const svgElement = svgRef.current;
      if (!svgElement) return;
      const svgRect = svgElement.getBoundingClientRect();

      const viewBox = svgElement.viewBox.baseVal;
      if (!viewBox || !viewBox.width || !viewBox.height || !svgRect.width || !svgRect.height) {
          console.error("Cannot calculate drop coordinates: SVG dimensions or viewBox missing.");
          return;
      }

      const scaleX = viewBox.width / svgRect.width;
      const scaleY = viewBox.height / svgRect.height;

      const defaultWidth = 100;
      const defaultHeight = 100;
      const x = (e.clientX - svgRect.left) * scaleX - defaultWidth / 2;
      const y = (e.clientY - svgRect.top) * scaleY - defaultHeight / 2;

      onDropItem(originalSvgId, x, y);

    } catch (err) {
      console.error('Error processing drop on canvas:', err);
      alert('Failed to add SVG from drop. See console.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const renderSvgContent = (item: SvgItem) => {
    if (!item.content) {
      return <image href={item.url} width={item.width} height={item.height} />;
    }
    try {
      const sanitizedContent = item.content.replace(/<script.*?<\/script>/gs, '');
      // Attempt to parse and find the root SVG element to apply width/height directly
      // This is a simplified approach; robust parsing might be needed for complex SVGs
      const parser = new DOMParser();
      const doc = parser.parseFromString(sanitizedContent, "image/svg+xml");
      const svgElement = doc.documentElement;

      if (svgElement && svgElement.nodeName === 'svg') {
          svgElement.setAttribute('width', item.width.toString());
          svgElement.setAttribute('height', item.height.toString());
          // Preserve aspect ratio if viewBox is present
          if (svgElement.getAttribute('viewBox')) {
              svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          }
          const modifiedSvgString = new XMLSerializer().serializeToString(svgElement);
          return <g dangerouslySetInnerHTML={{ __html: modifiedSvgString }} />;
      } else {
          // Fallback if parsing fails or it's not a standard SVG structure
          console.warn("Could not parse SVG content for resizing, using transform scale.");
          return (
              <g
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  transform={`scale(${item.width / 100}, ${item.height / 100})`} // Fallback scaling
              />
          );
      }
    } catch (error) {
      console.error("Error rendering SVG content:", error);
      return <rect width={item.width} height={item.height} fill="red" />;
    }
  };


  return (
    <div
      className="w-full h-full flex items-center justify-center bg-gray-50"
      onDrop={handleCanvasDrop}
      onDragOver={handleDragOver}
    >
      <svg
        ref={svgRef}
        className="canvas-area w-4/5 h-4/5 border border-gray-400 rounded bg-white shadow-inner"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* <rect width="100%" height="100%" fill="url(#grid)" /> */}
        <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth="1"/>
            </pattern>
        </defs>

        {items.map((item) => {
          if (!nodeRefs.current.has(item.id)) {
            nodeRefs.current.set(item.id, createRef());
          }
          const nodeRef = nodeRefs.current.get(item.id);

          return (
            <Draggable
              key={item.id}
              nodeRef={nodeRef}
              position={{ x: item.x, y: item.y }}
              onStop={(e, data) => handleDrag(e, data, item)}
              handle=".draggable-handle"
              cancel=".resize-handle, .delete-button" // Prevent dragging when clicking resize/delete handles
            >
              <g ref={nodeRef} className="draggable-svg group">
                 {/* Draggable Handle (covers the whole item) */}
                 <rect
                    className="draggable-handle cursor-move"
                    width={item.width}
                    height={item.height}
                    fill="transparent"
                 />

                {/* Render SVG Content */}
                {renderSvgContent(item)}

                {/* Resize handles - Show on hover */}
                {/* SE */}
                <circle
                  cx={item.width} cy={item.height} r={6} fill="#3b82f6"
                  onMouseDown={(e) => handleResize(e, item, 'se')}
                  className="resize-handle cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {/* SW */}
                 <circle
                  cx={0} cy={item.height} r={6} fill="#3b82f6"
                  onMouseDown={(e) => handleResize(e, item, 'sw')}
                  className="resize-handle cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {/* NE */}
                 <circle
                  cx={item.width} cy={0} r={6} fill="#3b82f6"
                  onMouseDown={(e) => handleResize(e, item, 'ne')}
                  className="resize-handle cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {/* NW */}
                 <circle
                  cx={0} cy={0} r={6} fill="#3b82f6"
                  onMouseDown={(e) => handleResize(e, item, 'nw')}
                  className="resize-handle cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"
                />
                 {/* Optional: Border on hover */}
                 <rect
                    x="-1" y="-1"
                    width={item.width + 2} height={item.height + 2}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                 />

                 {/* *** NEW: Delete Button *** */}
                 <g
                    className="delete-button cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    // Position the whole group (circle + icon) top-right, offset slightly
                    transform={`translate(${item.width - 8}, ${-8})`}
                    onMouseDown={(e) => {
                        e.stopPropagation(); // Prevent drag start
                        onDeleteItem(item.id);
                    }}
                    onClick={(e) => e.stopPropagation()} // Also stop click propagation
                 >
                    {/* Red background circle, centered at this <g>'s origin (0,0) */}
                    <circle cx="0" cy="0" r="10" fill="#ef4444" /> {/* Red background, radius 10 */}
                    {/* Icon is rendered relative to this <g>'s origin (0,0) */}
                    {/* Its own x/y attributes handle the centering */}
                    <DeleteIcon />
                 </g>
              </g>
            </Draggable>
          );
        })}
      </svg>
    </div>
  );
};

export default SvgCanvas;
