// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\App.tsx
import { useState } from 'react';
import { SvgItem, UploadedSvg } from './types';
import SvgCanvas from './components/SvgCanvas';
import Sidebar from './components/Sidebar';
import './index.css';
// Import uuid if you prefer it over crypto.randomUUID
// import { v4 as uuidv4 } from 'uuid';

function App() {
  const [uploadedSvgs, setUploadedSvgs] = useState<UploadedSvg[]>([]);
  const [canvasItems, setCanvasItems] = useState<SvgItem[]>([]);

  const handleSvgUpload = (svg: UploadedSvg) => {
    setUploadedSvgs(prev => [...prev, svg]);
  };

  // Handler for adding via double-click or button
  const handleAddToCanvas = (svg: UploadedSvg) => {
    const originalSvg = uploadedSvgs.find(item => item.id === svg.id) || svg;
    const newItem: SvgItem = {
      id: crypto.randomUUID(),
      url: originalSvg.url,
      content: originalSvg.content,
      x: 50, y: 50, width: 100, height: 100
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  // Handler specifically for items dropped onto the canvas
  const handleDropOnCanvas = (originalSvgId: string, x: number, y: number) => {
    const originalSvg = uploadedSvgs.find(svg => svg.id === originalSvgId);
    if (!originalSvg) {
      console.error("Dropped SVG not found in uploaded list:", originalSvgId);
      alert("Error: Could not find the original SVG data for the dropped item.");
      return;
    }
    const newItem: SvgItem = {
      id: crypto.randomUUID(),
      url: originalSvg.url,
      content: originalSvg.content,
      x: x, y: y, width: 100, height: 100
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  // Simplified handler: only updates existing items
  const handleUpdateCanvasItem = (updatedItem: SvgItem) => {
    setCanvasItems(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // *** NEW: Handler for deleting an item from the canvas ***
  const handleDeleteCanvasItem = (itemIdToDelete: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== itemIdToDelete));
  };

  const handleExport = () => {
    const exportData = canvasItems.map(({ id, url, x, y, width, height }) => ({
      id, url, x, y, width, height
    }));
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => alert('Layout copied to clipboard!'))
      .catch(err => {
        console.error('Failed to copy layout to clipboard:', err);
        alert('Error copying to clipboard. See console for details.');
      });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="flex-1 p-4 flex items-center justify-center overflow-hidden">
        <SvgCanvas
          items={canvasItems}
          onUpdateItem={handleUpdateCanvasItem}
          onDropItem={handleDropOnCanvas}
          onDeleteItem={handleDeleteCanvasItem} // <-- Pass the new handler
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
