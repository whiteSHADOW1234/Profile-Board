import { useState } from 'react';
import { SvgItem, UploadedSvg } from './types';
import SvgCanvas from './components/SvgCanvas.tsx';
import Sidebar from './components/Sidebar.tsx';
import './index.css';

function App() {
  const [uploadedSvgs, setUploadedSvgs] = useState<UploadedSvg[]>([]);
  const [canvasItems, setCanvasItems] = useState<SvgItem[]>([]);

  const handleSvgUpload = (svg: UploadedSvg) => {
    setUploadedSvgs(prev => [...prev, svg]);
  };

  const handleAddToCanvas = (svg: UploadedSvg) => {
    const newItem: SvgItem = {
      id: svg.id,
      url: svg.url,
      content: svg.content,
      x: 50,
      y: 50,
      width: 100,
      height: 100
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  const handleUpdateCanvasItem = (updatedItem: SvgItem) => {
    const exists = canvasItems.some(item => item.id === updatedItem.id);
    
    if (exists) {
      setCanvasItems(prev => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
    } else {
      // Add as new item if it doesn't exist yet (for drag and drop)
      setCanvasItems(prev => [...prev, updatedItem]);
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