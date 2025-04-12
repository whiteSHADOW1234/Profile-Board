// c:\Users\Huang\Desktop\OpenSourceStuff\profile-board\src\App.tsx
import { useState } from 'react';
// Updated import names
import { CanvasItem, UploadedAsset } from './types';
import SvgCanvas from './components/SvgCanvas';
import Sidebar from './components/Sidebar';
import './index.css';
// import { v4 as uuidv4 } from 'uuid'; // Use crypto.randomUUID if available

function App() {
  // Updated state names
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);

  // Updated handler name and type
  const handleAssetUpload = (asset: UploadedAsset) => {
    setUploadedAssets(prev => [...prev, asset]);
  };

  // Updated handler name and type
  const handleAddToCanvas = (asset: UploadedAsset) => {
    // Find the original asset data if needed (though asset passed in should be complete)
    const originalAsset = uploadedAssets.find(item => item.id === asset.id) || asset;
    const newItem: CanvasItem = {
      id: crypto.randomUUID(),
      url: originalAsset.url,
      type: originalAsset.type, // <-- Copy type
      content: originalAsset.content, // <-- Copy content (if any)
      x: 50, y: 50, width: 100, height: 100 // Default size/position
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  // Updated handler name and type
  const handleDropOnCanvas = (originalAssetId: string, x: number, y: number) => {
    const originalAsset = uploadedAssets.find(asset => asset.id === originalAssetId);
    if (!originalAsset) {
      console.error("Dropped Asset not found in uploaded list:", originalAssetId);
      alert("Error: Could not find the original asset data for the dropped item.");
      return;
    }
    const newItem: CanvasItem = {
      id: crypto.randomUUID(),
      url: originalAsset.url,
      type: originalAsset.type, // <-- Copy type
      content: originalAsset.content, // <-- Copy content (if any)
      x: x, y: y, width: 100, height: 100 // Use drop coords, default size
    };
    setCanvasItems(prev => [...prev, newItem]);
  };

  // Updated handler name and type
  const handleUpdateCanvasItem = (updatedItem: CanvasItem) => {
    setCanvasItems(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Handler name is fine, type is just string ID
  const handleDeleteCanvasItem = (itemIdToDelete: string) => {
    setCanvasItems(prev => prev.filter(item => item.id !== itemIdToDelete));
  };

  // Export logic remains the same for now (exports basic placement info)
  const handleExport = () => {
    // Export type if needed for more robust reloading? For now, keep it simple.
    const exportData = canvasItems.map(({ id, url, type, x, y, width, height }) => ({
      id, url, type, x, y, width, height // Added type to export
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
          items={canvasItems} // Prop name kept as items for simplicity in SvgCanvas
          onUpdateItem={handleUpdateCanvasItem}
          onDropItem={handleDropOnCanvas}
          onDeleteItem={handleDeleteCanvasItem}
        />
      </div>
      <Sidebar
        // Pass updated state and handlers
        uploadedAssets={uploadedAssets}
        onAssetUpload={handleAssetUpload}
        onAddToCanvas={handleAddToCanvas}
        onExport={handleExport}
      />
    </div>
  );
}

export default App;
