// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\components\SvgCanvas.tsx
import { useRef, createRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { CanvasItem  } from '../types';

interface SvgCanvasProps {
  items: CanvasItem [];
  onUpdateItem: (item: CanvasItem ) => void;
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

  const handleDrag = (_: any, data: any, item: CanvasItem ) => {
    onUpdateItem({
      ...item,
      x: data.x,
      y: data.y
    });
  };

  const handleResize = (e: React.MouseEvent, item: CanvasItem , corner: string) => {
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

  const renderCanvasItemContent = (item: CanvasItem) => { // <-- Renamed from renderSvgContent
    // Use SVG <image> element for both SVGs and other image types via URL.
    // It handles rendering external resources.
    // If we have raw SVG content AND type is svg, we could embed, but <image> is simpler.
    if (item.type === 'svg' && item.content) {
        // Option 1: Embed SVG content directly (more complex parsing needed for reliable size)
        try {
            const sanitizedContent = item.content.replace(/<script.*?<\/script>/gs, '');
            const parser = new DOMParser();
            const doc = parser.parseFromString(sanitizedContent, "image/svg+xml");
            const svgElement = doc.documentElement;

            if (svgElement && svgElement.nodeName === 'svg') {
                svgElement.setAttribute('width', item.width.toString());
                svgElement.setAttribute('height', item.height.toString());
                if (svgElement.getAttribute('viewBox')) {
                    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                } else {
                     svgElement.removeAttribute('preserveAspectRatio');
                }
                const modifiedSvgString = new XMLSerializer().serializeToString(svgElement);
                // Wrap in a <g> to ensure transforms apply correctly if needed elsewhere
                return <g dangerouslySetInnerHTML={{ __html: modifiedSvgString }} />;
            } else {
                 console.warn("Parsed content is not a valid SVG root element. Falling back to <image> tag.");
                 // Fall through to Option 2
            }
        } catch (error) {
            console.error("Error rendering embedded SVG content, falling back to <image>:", error);
             // Fall through to Option 2
        }
    }

    // Option 2: Use <image> tag (Simpler, works for SVG URLs, external images, blob URLs)
    return (
      <image
        href={item.url}
        width={item.width}
        height={item.height}
        preserveAspectRatio="xMidYMid meet" // Control scaling
      />
    );
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
              handle=".draggable-handle" // Still use the handle class
              cancel=".resize-handle, .delete-button"
            >
              {/* Main group for the draggable item */}
              <g ref={nodeRef} className="draggable-svg group">

                {/* 1. Render Item Content FIRST */}
                {renderCanvasItemContent(item)} {/* Use updated render function */}

                {/* 2. Render Controls (Resize handles, Delete Button, Border) SECOND */}
                {/*    Their own event handlers prevent drag start */}
                {/* Resize handles */}
                <circle cx={item.width} cy={item.height} r={6} fill="#3b82f6" onMouseDown={(e) => handleResize(e, item, 'se')} className="resize-handle cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"/>
                <circle cx={0} cy={item.height} r={6} fill="#3b82f6" onMouseDown={(e) => handleResize(e, item, 'sw')} className="resize-handle cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"/>
                <circle cx={item.width} cy={0} r={6} fill="#3b82f6" onMouseDown={(e) => handleResize(e, item, 'ne')} className="resize-handle cursor-ne-resize opacity-0 group-hover:opacity-100 transition-opacity"/>
                <circle cx={0} cy={0} r={6} fill="#3b82f6" onMouseDown={(e) => handleResize(e, item, 'nw')} className="resize-handle cursor-nw-resize opacity-0 group-hover:opacity-100 transition-opacity"/>
                {/* Optional: Border */}
                <rect x="-1" y="-1" width={item.width + 2} height={item.height + 2} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"/>
                {/* Delete Button */}
                <g className="delete-button cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" transform={`translate(${item.width - 8}, ${-8})`} onMouseDown={(e) => { e.stopPropagation(); onDeleteItem(item.id); }} onClick={(e) => e.stopPropagation()}>
                    <circle cx="0" cy="0" r="10" fill="#ef4444" />
                    <DeleteIcon />
                </g>

                {/* 3. Render Draggable Handle LAST (so it's on top) */}
                <rect
                    className="draggable-handle cursor-move"
                    width={item.width}
                    height={item.height}
                    fill="transparent" // Still transparent
                    // No x/y needed as it's positioned relative to the <g> which is already transformed
                />

              </g>
            </Draggable>
          );
        })}
      </svg>
    </div>
  );
};

export default SvgCanvas;
