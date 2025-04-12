import { useRef, createRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { SvgItem, UploadedSvg } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SvgCanvasProps {
  items: SvgItem[];
  onUpdateItem: (item: SvgItem) => void;
}

const SvgCanvas = ({ items, onUpdateItem }: SvgCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // Create a ref map for the draggable items
  const nodeRefs = useRef(new Map());

  // Update refs when items change
  useEffect(() => {
    // Clean up old refs that are no longer needed
    const currentIds = new Set(items.map(item => item.id));
    [...nodeRefs.current.keys()].forEach(id => {
      if (!currentIds.has(id as string)) {
        nodeRefs.current.delete(id);
      }
    });
    
    // Ensure every item has a ref
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
    e.stopPropagation();
    
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
      
      const droppedSvg: UploadedSvg = JSON.parse(jsonData);
      
      // Get position relative to the SVG canvas
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      // Calculate position in SVG coordinates
      const viewBox = svgRef.current?.viewBox.baseVal;
      if (!viewBox) return;
      
      const scaleX = viewBox.width / svgRect.width;
      const scaleY = viewBox.height / svgRect.height;
      
      const x = (e.clientX - svgRect.left) * scaleX;
      const y = (e.clientY - svgRect.top) * scaleY;
      
      const newItem: SvgItem = {
        id: uuidv4(), // Generate a new ID for the canvas item
        url: droppedSvg.url,
        content: droppedSvg.content,
        x,
        y,
        width: 100,
        height: 100
      };
      
      onUpdateItem(newItem);
    } catch (err) {
      console.error('Error adding SVG to canvas:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      onDrop={handleCanvasDrop}
      onDragOver={handleDragOver}
    >
      <svg 
        ref={svgRef}
        className="canvas-area w-4/5 h-4/5 border border-gray-300 rounded"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        {items.map((item) => {
          // Get or create a ref for this item
          if (!nodeRefs.current.has(item.id)) {
            nodeRefs.current.set(item.id, createRef());
          }
          const nodeRef = nodeRefs.current.get(item.id);
          
          return (
            <Draggable
              key={item.id}
              nodeRef={nodeRef}
              position={{ x: item.x, y: item.y }}
              onDrag={(e, data) => handleDrag(e, data, item)}
              bounds="parent"
            >
              <g ref={nodeRef} className="draggable-svg">
                {item.content ? (
                  <g 
                    dangerouslySetInnerHTML={{ __html: item.content }} 
                    transform={`scale(${item.width / 100}, ${item.height / 100})`}
                  />
                ) : (
                  <image
                    href={item.url}
                    width={item.width}
                    height={item.height}
                  />
                )}
                
                {/* Resize handles */}
                <circle 
                  cx={item.width} 
                  cy={item.height} 
                  r={5} 
                  fill="#007bff" 
                  onMouseDown={(e) => handleResize(e, item, 'se')}
                  className="cursor-se-resize"
                />
                <circle 
                  cx={0} 
                  cy={item.height} 
                  r={5} 
                  fill="#007bff" 
                  onMouseDown={(e) => handleResize(e, item, 'sw')}
                  className="cursor-sw-resize"
                />
                <circle 
                  cx={item.width} 
                  cy={0} 
                  r={5} 
                  fill="#007bff" 
                  onMouseDown={(e) => handleResize(e, item, 'ne')}
                  className="cursor-ne-resize"
                />
                <circle 
                  cx={0} 
                  cy={0} 
                  r={5} 
                  fill="#007bff" 
                  onMouseDown={(e) => handleResize(e, item, 'nw')}
                  className="cursor-nw-resize"
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