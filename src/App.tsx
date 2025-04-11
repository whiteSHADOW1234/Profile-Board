import { useState } from 'react';
import { SvgItem, UploadedSvg } from './types';
import SvgCanvas from './components/SvgCanvas';
import Sidebar from './components/Sidebar';
import './index.css';

function App() {
  const [uploadedSvgs, setUploadedSvgs] = useState<UploadedSvg[]>([]);
  const [canvasItems, setCanvasItems] = useState<SvgItem[]>([]);

  const handleSvgUpload = (svg: UploadedSvg) => {
    setUploadedSvgs(prev => [...prev, svg]);
  };

  const handleAddToCanvas = (svg: UploadedSvg) => {
    // Find the original SVG from our uploads to ensure we have the full data
    const originalSvg = uploadedSvgs.find(item => item.id === svg.id) || svg;
    
    const newItem: SvgItem = {
      id: crypto.randomUUID(), // Generate a new ID for each canvas instance
      url: originalSvg.url,
      content: originalSvg.content,
      x: 100,
      y: 100,
      width: 100,
      height: 100
    };
    
    setCanvasItems(prev => [...prev, newItem]);
  };

  const handleUpdateCanvasItem = (updatedItem: SvgItem) => {
    // Check if the item exists
    const exists = canvasItems.some(item => item.id === updatedItem.id);
    
    if (exists) {
      // Update existing item
      setCanvasItems(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    } else {
      // If it's a new item from drag-drop, we need to find the original SVG data
      const droppedSvgId = updatedItem.id;
      const originalSvg = uploadedSvgs.find(svg => svg.id === droppedSvgId);
      
      if (originalSvg) {
        // Create a new canvas item with original SVG data
        const newItem: SvgItem = {
          id: crypto.randomUUID(),
          url: originalSvg.url,
          content: originalSvg.content,
          x: updatedItem.x,
          y: updatedItem.y,
          width: 100,
          height: 100
        };
        
        setCanvasItems(prev => [...prev, newItem]);
      } else {
        // Just add the item as is (fallback)
        setCanvasItems(prev => [...prev, updatedItem]);
      }
    }
  };

  const handleExport = () => {
    const exportData = canvasItems.map(({ id, url, x, y, width, height }) => ({
      id, url, x, y, width, height
    }));
    
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => {
        alert('Layout copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy layout to clipboard:', err);
        alert('Error copying to clipboard. See console for details.');
      });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="flex-1 p-4 flex items-center justify-center">
        <SvgCanvas 
          items={canvasItems} 
          onUpdateItem={handleUpdateCanvasItem} 
        />
      </div>
      <Sidebar 
        uploadedSvgs={uploadedSvgs}
        onSvgUpload={handleSvgUpload}
        onAddToCanvas={handleAddToCanvas}
        onExport={handleExport}
      />
    </div>
  );
}

export default App;